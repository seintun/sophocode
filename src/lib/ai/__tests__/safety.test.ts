import { describe, expect, it } from 'vitest';
import { sanitizeCoachingContent } from '../safety';

describe('sanitizeCoachingContent', () => {
  it('removes fenced code blocks to prevent copy-paste solutions', () => {
    const input = `Use this approach:\n\n\`\`\`python\ndef twoSum(nums, target):\n  return [0, 1]\n\`\`\`\n\nReason about complements.`;
    const output = sanitizeCoachingContent(input);

    expect(output).toContain('[Code removed by coach safety policy]');
    expect(output).not.toContain('def twoSum');
    expect(output).toContain('Reason about complements.');
  });

  it('refuses plain-text pseudocode even without fenced code blocks', () => {
    const input = `Try this:\n\ndef twoSum(nums, target):\n  seen = {}\n  for i, num in enumerate(nums):\n    complement = target - num\n    if complement in seen:\n      return [seen[complement], i]`;

    const output = sanitizeCoachingContent(input);

    expect(output.toLowerCase()).toContain("can't provide pseudocode");
    expect(output.toLowerCase()).not.toContain('def twosum');
    expect(output.toLowerCase()).not.toContain('return [seen[complement], i]');
  });

  it('allows limited pseudocode in SELF_PRACTICE mode', () => {
    const input = `Concept sketch:\n- Keep a seen map\n- For each number, compute complement\n- If complement was seen, that pair works`;
    const output = sanitizeCoachingContent(input, { mode: 'SELF_PRACTICE' });

    expect(output).toContain('Concept sketch');
    expect(output.toLowerCase()).not.toContain("can't provide pseudocode");
  });

  it('still refuses full-solution style output in SELF_PRACTICE mode', () => {
    const input = `def twoSum(nums, target):\n  seen = {}\n  for i, num in enumerate(nums):\n    complement = target - num\n    if complement in seen:\n      return [seen[complement], i]\n    seen[num] = i\n  return []`;

    const output = sanitizeCoachingContent(input, { mode: 'SELF_PRACTICE' });

    expect(output.toLowerCase()).toContain("can't provide pseudocode");
  });
});
