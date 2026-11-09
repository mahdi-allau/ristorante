import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { sendGiftCardEmails } from '@/lib/email';
import { markPaid } from '@/lib/gift-store';
import { constructWebhookEvent } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: 'disabled' }, { status: 503 });

  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'no signature' }, { status: 400 });

  // Serve il corpo grezzo: la firma si calcola sui byte esatti inviati da Stripe
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(raw, signature);
  } catch {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    const code = session.metadata?.code ?? session.client_reference_id;

    // Con pagamenti asincroni (es. bonifico) 'completed' arriva prima del pagamento: si attende l'evento successivo
    if (code && session.payment_status === 'paid') {
      if (session.currency !== 'eur') {
        console.error('gift card: valuta inattesa', session.currency, code);
        return NextResponse.json({ received: true });
      }
      try {
        const res = await markPaid(code, session.id, session.amount_total ?? -1);
        if (res?.activated) await sendGiftCardEmails(res.card);
        if (!res) console.error('gift card: codice sconosciuto', code);
      } catch (e) {
        // Importo diverso o errore di archivio: non attivare e non far ritentare all'infinito se è un caso di dati
        console.error('gift card: attivazione fallita', e);
        return NextResponse.json({ error: 'processing' }, { status: 500 });
      }
    }
  }
  return NextResponse.json({ received: true });
}
