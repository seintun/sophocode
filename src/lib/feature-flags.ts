/**
 * Feature flags shared across server and client.
 *
 * Premium gating defaults to OFF for now (all users can access premium routes/features).
 * Set either env var to true to re-enable strict premium gating:
 * - PREMIUM_GATING_ENABLED=true
 * - NEXT_PUBLIC_PREMIUM_GATING_ENABLED=true
 */
export const PREMIUM_GATING_ENABLED =
  process.env.NEXT_PUBLIC_PREMIUM_GATING_ENABLED === 'true' ||
  process.env.PREMIUM_GATING_ENABLED === 'true';
