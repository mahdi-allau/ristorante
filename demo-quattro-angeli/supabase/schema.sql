-- Schema prenotazioni. DA ESEGUIRE nel SQL editor del progetto Supabase del cliente.
-- Non è stato eseguito né testato su un database reale.

create extension if not exists "pgcrypto";

create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  date        date not null,
  time        time not null,
  guests      int  not null check (guests between 1 and 20),
  name        text not null,
  phone       text not null,
  email       text not null,
  notes       text not null default '',
  marketing   boolean not null default false,   -- consenso marketing separato
  locale      text not null default 'it',
  status      text not null default 'confirmed' check (status in ('confirmed','cancelled','no_show','completed'))
);

create index if not exists bookings_date_time_idx on public.bookings (date, time);

-- RLS attiva e nessuna policy: nessun accesso dal browser. Solo il server (service_role) legge/scrive.
alter table public.bookings enable row level security;

-- Prenotazione atomica: controlla la capienza e inserisce nella stessa transazione.
create or replace function public.create_booking(
  p_date date, p_time time, p_guests int, p_name text, p_phone text,
  p_email text, p_notes text, p_marketing boolean, p_locale text, p_cap int
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  used int;
  new_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext(p_date::text || p_time::text));
  select coalesce(sum(guests), 0) into used
    from bookings where date = p_date and time = p_time and status = 'confirmed';
  if used + p_guests > p_cap then
    return null;
  end if;
  insert into bookings (date, time, guests, name, phone, email, notes, marketing, locale)
  values (p_date, p_time, p_guests, p_name, p_phone, p_email, p_notes, p_marketing, p_locale)
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.create_booking(date, time, int, text, text, text, text, boolean, text, int) from public, anon, authenticated;
grant execute on function public.create_booking(date, time, int, text, text, text, text, boolean, text, int) to service_role;

-- Retention: elimina le prenotazioni più vecchie di 24 mesi (pianifica con pg_cron o una funzione schedulata).
-- delete from public.bookings where date < (current_date - interval '24 months');

-- Contenuti modificabili dal pannello /admin (menu, orari, chiusure, avviso): un solo documento JSON.
create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security; -- nessuna policy: accesso solo dal server (service_role)

-- ============ Gift card (Stripe) ============
-- Importi in centesimi di euro. La carta nasce 'pending' e diventa 'active' solo dal webhook Stripe.
create table if not exists public.gift_cards (
  code               text primary key,                -- es. K7MQ-2XWD-9RTB
  status             text not null default 'pending' check (status in ('pending','active','void')),
  amount             int  not null check (amount > 0),
  balance            int  not null default 0 check (balance >= 0),
  buyer_name         text not null,
  buyer_email        text not null,
  recipient_name     text not null default '',
  recipient_email    text not null default '',
  message            text not null default '',
  locale             text not null default 'it',
  stripe_session_id  text unique,
  demo               boolean not null default false,
  created_at         timestamptz not null default now(),
  paid_at            timestamptz,
  expires_at         timestamptz
);

create table if not exists public.gift_card_redemptions (
  id          bigint generated always as identity primary key,
  code        text not null references public.gift_cards(code),
  amount      int  not null check (amount > 0),
  note        text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists gift_card_redemptions_code_idx on public.gift_card_redemptions (code);

alter table public.gift_cards enable row level security;            -- nessuna policy: solo server (service_role)
alter table public.gift_card_redemptions enable row level security;

-- Riscatto atomico: scala dal saldo e registra il movimento nella stessa transazione.
-- Restituisce 'ok' oppure 'not_found' | 'inactive' | 'expired' | 'insufficient'.
create or replace function public.redeem_gift_card(p_code text, p_amount int, p_note text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare c public.gift_cards%rowtype;
begin
  select * into c from gift_cards where code = p_code for update;
  if not found then return 'not_found'; end if;
  if c.status <> 'active' then return 'inactive'; end if;
  if c.expires_at is not null and c.expires_at < now() then return 'expired'; end if;
  if p_amount <= 0 or p_amount > c.balance then return 'insufficient'; end if;
  update gift_cards set balance = balance - p_amount where code = p_code;
  insert into gift_card_redemptions (code, amount, note) values (p_code, p_amount, p_note);
  return 'ok';
end;
$$;
revoke all on function public.redeem_gift_card(text, int, text) from public, anon, authenticated;
grant execute on function public.redeem_gift_card(text, int, text) to service_role;

-- ============ Promemoria e gestione prenotazione (migrazione additiva) ============
alter table public.bookings add column if not exists manage_token       text unique;  -- segreto nel link "gestisci prenotazione"
alter table public.bookings add column if not exists reminder_sent_at   timestamptz;  -- promemoria 24 h già inviato
alter table public.bookings add column if not exists guest_confirmed_at timestamptz;  -- il cliente ha confermato dal link
alter table public.bookings add column if not exists cancelled_at       timestamptz;
create index if not exists bookings_reminder_idx on public.bookings (date) where status = 'confirmed' and reminder_sent_at is null;

-- Nuova versione di create_booking con il token (sostituisce quella senza p_token).
drop function if exists public.create_booking(date, time, int, text, text, text, text, boolean, text, int);
create or replace function public.create_booking(
  p_date date, p_time time, p_guests int, p_name text, p_phone text,
  p_email text, p_notes text, p_marketing boolean, p_locale text, p_cap int, p_token text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  used int;
  new_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext(p_date::text || p_time::text));
  select coalesce(sum(guests), 0) into used
    from bookings where date = p_date and time = p_time and status = 'confirmed';
  if used + p_guests > p_cap then
    return null;
  end if;
  insert into bookings (date, time, guests, name, phone, email, notes, marketing, locale, manage_token)
  values (p_date, p_time, p_guests, p_name, p_phone, p_email, p_notes, p_marketing, p_locale, p_token)
  returning id into new_id;
  return new_id;
end;
$$;
revoke all on function public.create_booking(date, time, int, text, text, text, text, boolean, text, int, text) from public, anon, authenticated;
grant execute on function public.create_booking(date, time, int, text, text, text, text, boolean, text, int, text) to service_role;

-- ============ Pannello sala (migrazione additiva) ============
alter table public.bookings add column if not exists source     text not null default 'web' check (source in ('web','staff'));
alter table public.bookings add column if not exists staff_note text not null default '';

-- Nuovo stato 'seated' (al tavolo). Occupano coperti: confirmed, seated, completed. Liberano: cancelled, no_show.
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('confirmed','seated','completed','cancelled','no_show'));

-- create_booking: la capienza ora conta anche i tavoli già seduti o conclusi.
create or replace function public.create_booking(
  p_date date, p_time time, p_guests int, p_name text, p_phone text,
  p_email text, p_notes text, p_marketing boolean, p_locale text, p_cap int, p_token text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  used int;
  new_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext(p_date::text || p_time::text));
  select coalesce(sum(guests), 0) into used
    from bookings where date = p_date and time = p_time and status in ('confirmed','seated','completed');
  if used + p_guests > p_cap then
    return null;
  end if;
  insert into bookings (date, time, guests, name, phone, email, notes, marketing, locale, manage_token)
  values (p_date, p_time, p_guests, p_name, p_phone, p_email, p_notes, p_marketing, p_locale, p_token)
  returning id into new_id;
  return new_id;
end;
$$;

-- Modifica da parte dello staff (stato, spostamento, dati) con controllo atomico della capienza.
-- p_patch: json con i campi da cambiare (status, date, time, guests, name, phone, email, notes, staff_note).
-- Restituisce 'ok' | 'full' | 'not_found'. Se cambiano data o ora, promemoria e conferma del cliente ripartono.
create or replace function public.staff_update_booking(p_id uuid, p_patch jsonb, p_cap int)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  b bookings%rowtype;
  n_date date; n_time time; n_guests int; n_status text; used int; moved boolean;
begin
  select * into b from bookings where id = p_id for update;
  if not found then return 'not_found'; end if;

  n_date   := coalesce((p_patch->>'date')::date, b.date);
  n_time   := coalesce((p_patch->>'time')::time, b.time);
  n_guests := coalesce((p_patch->>'guests')::int, b.guests);
  n_status := coalesce(p_patch->>'status', b.status);
  moved    := (n_date <> b.date) or (n_time <> b.time);

  -- capienza controllata solo se la modifica può aumentare l'occupazione dello slot (spostamento, più persone, rientro in stato che occupa)
  if n_status in ('confirmed','seated','completed')
     and (moved or n_guests > b.guests or b.status not in ('confirmed','seated','completed')) then
    perform pg_advisory_xact_lock(hashtext(n_date::text || n_time::text));
    select coalesce(sum(guests), 0) into used from bookings
      where date = n_date and time = n_time and status in ('confirmed','seated','completed') and id <> p_id;
    if used + n_guests > p_cap then return 'full'; end if;
  end if;

  update bookings set
    status = n_status, date = n_date, time = n_time, guests = n_guests,
    name = coalesce(p_patch->>'name', name),
    phone = coalesce(p_patch->>'phone', phone),
    email = coalesce(p_patch->>'email', email),
    notes = coalesce(p_patch->>'notes', notes),
    staff_note = coalesce(p_patch->>'staff_note', staff_note),
    reminder_sent_at = case when moved then null else reminder_sent_at end,
    guest_confirmed_at = case when moved then null else guest_confirmed_at end,
    cancelled_at = case when n_status = 'cancelled' and b.status <> 'cancelled' then now()
                        when n_status <> 'cancelled' then null else cancelled_at end
  where id = p_id;
  return 'ok';
end;
$$;
revoke all on function public.staff_update_booking(uuid, jsonb, int) from public, anon, authenticated;
grant execute on function public.staff_update_booking(uuid, jsonb, int) to service_role;

-- ============ Richieste di recensione (migrazione additiva) ============
alter table public.bookings add column if not exists review_opt_in        boolean not null default false;  -- il cliente ha spuntato la casella
alter table public.bookings add column if not exists review_opt_out       boolean not null default false;  -- si è disiscritto (vale per la stessa email)
alter table public.bookings add column if not exists review_requested_at   timestamptz;                      -- richiesta già inviata (una sola volta)
create index if not exists bookings_review_idx on public.bookings (date)
  where status in ('seated','completed') and review_requested_at is null and review_opt_out = false;

-- staff_update_booking: ora accetta anche review_opt_in nel patch (resto invariato).
create or replace function public.staff_update_booking(p_id uuid, p_patch jsonb, p_cap int)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  b bookings%rowtype;
  n_date date; n_time time; n_guests int; n_status text; used int; moved boolean;
begin
  select * into b from bookings where id = p_id for update;
  if not found then return 'not_found'; end if;

  n_date   := coalesce((p_patch->>'date')::date, b.date);
  n_time   := coalesce((p_patch->>'time')::time, b.time);
  n_guests := coalesce((p_patch->>'guests')::int, b.guests);
  n_status := coalesce(p_patch->>'status', b.status);
  moved    := (n_date <> b.date) or (n_time <> b.time);

  -- capienza controllata solo se la modifica può aumentare l'occupazione dello slot
  if n_status in ('confirmed','seated','completed')
     and (moved or n_guests > b.guests or b.status not in ('confirmed','seated','completed')) then
    perform pg_advisory_xact_lock(hashtext(n_date::text || n_time::text));
    select coalesce(sum(guests), 0) into used from bookings
      where date = n_date and time = n_time and status in ('confirmed','seated','completed') and id <> p_id;
    if used + n_guests > p_cap then return 'full'; end if;
  end if;

  update bookings set
    status = n_status, date = n_date, time = n_time, guests = n_guests,
    name = coalesce(p_patch->>'name', name),
    phone = coalesce(p_patch->>'phone', phone),
    email = coalesce(p_patch->>'email', email),
    notes = coalesce(p_patch->>'notes', notes),
    staff_note = coalesce(p_patch->>'staff_note', staff_note),
    review_opt_in = coalesce((p_patch->>'review_opt_in')::boolean, review_opt_in),
    reminder_sent_at = case when moved then null else reminder_sent_at end,
    guest_confirmed_at = case when moved then null else guest_confirmed_at end,
    cancelled_at = case when n_status = 'cancelled' and b.status <> 'cancelled' then now()
                        when n_status <> 'cancelled' then null else cancelled_at end
  where id = p_id;
  return 'ok';
end;
$$;
