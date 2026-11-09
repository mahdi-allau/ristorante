import 'server-only';
import Stripe from 'stripe';

let client: Stripe | null = null;

export const isStripeConfigured = (): boolean => !!process.env.STRIPE_SECRET_KEY;

/**
 * Modalità demo dell'acquisto (nessun pagamento reale, la carta viene attivata subito).
 * Mai attiva in produzione a meno di GIFT_CARD_DEMO=1 esplicito: altrimenti chiunque
 * potrebbe "comprare" gift card gratis se la chiave Stripe manca per errore.
 */
export const isDemoCheckout = (): boolean =>
  !isStripeConfigured() && (process.env.NODE_ENV !== 'production' || process.env.GIFT_CARD_DEMO === '1');

export const isCheckoutAvailable = (): boolean => isStripeConfigured() || isDemoCheckout();

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY mancante');
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/** Verifica la firma del webhook; serve solo STRIPE_WEBHOOK_SECRET (la chiave API non è usata). */
export function constructWebhookEvent(rawBody: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET mancante');
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_unused').webhooks.constructEvent(rawBody, signature, secret);
}
