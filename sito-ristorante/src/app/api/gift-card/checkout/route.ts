import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SITE } from '@/content/site';
import { href } from '@/i18n/config';
import { sendGiftCardEmails } from '@/lib/email';
import { attachSession, createPending, GIFT_MAX_EUR, GIFT_MIN_EUR, markPaid } from '@/lib/gift-store';
import { rateLimit } from '@/lib/rate-limit';
import { getStripe, isDemoCheckout, isStripeConfigured } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const schema = z.object({
  amount: z.number().int().min(GIFT_MIN_EUR).max(GIFT_MAX_EUR), // euro interi
  buyerName: z.string().trim().min(2).max(80),
  buyerEmail: z.string().trim().email().max(120),
  recipientName: z.string().trim().max(80).optional().default(''),
  recipientEmail: z.union([z.string().trim().email().max(120), z.literal('')]).optional().default(''),
  message: z.string().trim().max(240).optional().default(''),
  privacy: z.literal(true),
  terms: z.literal(true),
  locale: z.enum(['it', 'en']).default('it'),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`giftcard:${ip}`, 6, 10 * 60 * 1000)) return NextResponse.json({ error: 'rate' }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid' }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid', field: parsed.error.issues[0]?.path[0] }, { status: 400 });
  const { website: _hp, privacy: _p, terms: _t, amount, ...d } = parsed.data;

  const demo = isDemoCheckout();
  if (!isStripeConfigured() && !demo) return NextResponse.json({ error: 'unavailable' }, { status: 503 });

  try {
    const card = await createPending({ ...d, amount: amount * 100, demo });
    const base = SITE.url;

    // Modalità demo: nessun pagamento, carta attivata subito (solo sviluppo o GIFT_CARD_DEMO=1)
    if (demo) {
      const res = await markPaid(card.code, `demo_${card.code}`, card.amount);
      if (res?.activated) await sendGiftCardEmails(res.card);
      return NextResponse.json({ ok: true, demo: true, url: `${base}${href(d.locale, `/gift-card/view/${card.code}`)}` });
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      locale: d.locale,
      customer_email: d.buyerEmail,
      client_reference_id: card.code,
      metadata: { code: card.code },
      payment_intent_data: { description: `Gift card ${SITE.name} ${card.code}`, metadata: { code: card.code } },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: card.amount,
          product_data: { name: `Gift card ${SITE.name}`, description: d.recipientName ? `Per ${d.recipientName}` : undefined },
        },
      }],
      success_url: `${base}${href(d.locale, '/gift-card/thanks')}`,
      cancel_url: `${base}${href(d.locale, '/gift-card')}`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // sessione valida 1 ora
    });
    if (!session.url) throw new Error('Stripe non ha restituito l\'URL di pagamento');
    await attachSession(card.code, session.id);
    return NextResponse.json({ ok: true, demo: false, url: session.url });
  } catch (e) {
    console.error('gift card checkout error', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
