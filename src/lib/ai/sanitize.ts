const MAX_PROMPT_FIELD_LENGTH = 4000;

export function sanitizeForPrompt(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`/g, '&#96;')
    .trim()
    .slice(0, MAX_PROMPT_FIELD_LENGTH);
}
