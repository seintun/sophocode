/**
 * Application configuration constants.
 * Centralizes environment-dependent values and tunable parameters.
 */

// ── Rate Limiting ───────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  /** Guest page requests per minute */
  GUEST_PAGE: { requests: 100, window: '1 m' },
  /** API route requests per minute per guestId */
  API: { requests: 200, window: '1 m' },
  /** Auth route requests per IP (brute force protection) */
  AUTH: { requests: 10, window: '1 m' },
} as const;

// ── AI Models ───────────────────────────────────────────────────────────────
// Tiered model selection for freemium. Defaults match the current grok setup.
// Override via OPENROUTER_MODEL_FREE / OPENROUTER_MODEL_PREMIUM env vars.

export const AI_MODELS = {
  FREE: process.env.OPENROUTER_MODEL_FREE ?? 'x-ai/grok-4.1-fast',
  PREMIUM: process.env.OPENROUTER_MODEL_PREMIUM ?? 'x-ai/grok-4.1-fast',
} as const;

/**
 * Resolve model by subscription tier.
 * Falls back to legacy AI_MODEL_REASONING / AI_MODEL_SUMMARY env vars.
 */
export function resolveModel(
  tier: 'FREE' | 'PREMIUM',
  purpose: 'reasoning' | 'summary' = 'reasoning',
): string {
  if (tier === 'PREMIUM') {
    return (
      process.env.OPENROUTER_MODEL_PREMIUM ??
      process.env[`AI_MODEL_${purpose.toUpperCase()}` as const] ??
      AI_MODELS.PREMIUM
    );
  }
  return (
    process.env.OPENROUTER_MODEL_FREE ??
    process.env[`AI_MODEL_${purpose.toUpperCase()}` as const] ??
    AI_MODELS.FREE
  );
}

// ── Token Budgets ───────────────────────────────────────────────────────────

export const TOKEN_LIMITS = {
  FREE: 100_000,
  PREMIUM: 500_000,
} as const;

export const TOKEN_ESTIMATE_PER_MESSAGE = 1_000;

// ── Cache TTLs (seconds) ───────────────────────────────────────────────────

export const CACHE_TTL = {
  /** AI response cache */
  AI_RESPONSE: 86_400, // 24 hours
  /** Problem list */
  PROBLEM_LIST: 300, // 5 minutes
  /** Problem list stale-while-revalidate */
  PROBLEM_LIST_SWR: 600, // 10 minutes
} as const;

// ── CSP ─────────────────────────────────────────────────────────────────────

export const CSP_ORIGINS = {
  scripts: ['https://vercel.live'],
  connect: ['https://api.openrouter.ai', 'https://*.upstash.io'],
} as const;
