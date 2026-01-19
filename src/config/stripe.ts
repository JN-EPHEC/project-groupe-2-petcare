/**
 * Configuration Stripe - Price IDs
 * 
 * IMPORTANT : Vous devez créer ces produits/prix dans votre Dashboard Stripe
 * et remplacer les IDs ci-dessous par vos propres Price IDs.
 * 
 * Pour créer les prix :
 * 1. Allez sur https://dashboard.stripe.com/test/products
 * 2. Créez un nouveau produit "PetCare Premium"
 * 3. Ajoutez 3 prix récurrents :
 *    - Mensuel : 1,49€ / mois
 *    - Trimestriel : 3,99€ / 3 mois
 *    - Annuel : 12,99€ / an
 * 4. Copiez les Price IDs (commencent par price_)
 */

export const STRIPE_PRICE_IDS = {
  // ✅ Price IDs Stripe configurés
  
  // Prix mensuel : 1,49€ / mois
  monthly: 'price_1SqhJFPl02UR2jNdGlIRio9x',
  
  // Prix trimestriel : 3,99€ / 3 mois  
  quarterly: 'price_1SqhJVPl02UR2jNdPNJezq8A',
  
  // Prix annuel : 12,99€ / an
  yearly: 'price_1SqhJpPl02UR2jNdZdC2f29y',
};

export interface PricingPlan {
  id: 'monthly' | 'quarterly' | 'yearly';
  name: string;
  priceId: string;
  price: string;
  period: string;
  billingPeriod: string;
  savings?: string;
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Mensuel',
    priceId: STRIPE_PRICE_IDS.monthly,
    price: '1,49€',
    period: 'mois',
    billingPeriod: 'Facturé tous les mois',
  },
  {
    id: 'quarterly',
    name: 'Trimestriel',
    priceId: STRIPE_PRICE_IDS.quarterly,
    price: '3,99€',
    period: '3 mois',
    billingPeriod: 'Facturé tous les 3 mois',
    savings: 'Économisez 11%',
    popular: true,
  },
  {
    id: 'yearly',
    name: 'Annuel',
    priceId: STRIPE_PRICE_IDS.yearly,
    price: '12,99€',
    period: 'an',
    billingPeriod: 'Facturé annuellement',
    savings: 'Économisez 28%',
  },
];

