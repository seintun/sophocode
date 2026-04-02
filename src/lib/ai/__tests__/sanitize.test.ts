import { describe, expect, it } from 'vitest';
import { sanitizeForPrompt } from '../sanitize';

describe('sanitizeForPrompt', () => {
  it('escapes html-like delimiters and markdown backticks', () => {
    const input = '<assistant>`code```</assistant>';
    const output = sanitizeForPrompt(input);

    expect(output).toContain('&lt;assistant&gt;');
    expect(output).toContain('&#96;');
    expect(output).not.toContain('<assistant>');
    expect(output).not.toContain('```');
  });
});
