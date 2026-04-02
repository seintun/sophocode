import { describe, expect, it } from 'vitest';
import { extractConstraints, extractExamples, extractStatement } from '../mappers';

describe('extractStatement', () => {
  it('removes example and constraints sections from statement markdown', () => {
    const html = `
      <p>Given an array of integers <code>nums</code> and an integer <code>target</code>.</p>
      <p>You can return the answer in any order.</p>
      <strong class="example">Example 1:</strong>
      <pre><strong>Input:</strong> nums = [2,7,11,15], target = 9\n<strong>Output:</strong> [0,1]</pre>
      <strong>Constraints:</strong>
      <ul>
        <li>2 <= nums.length <= 10^4</li>
      </ul>
    `;

    const statement = extractStatement(html);

    expect(statement).toContain('Given an array of integers');
    expect(statement).toContain('You can return the answer in any order.');
    expect(statement).not.toContain('Example 1');
    expect(statement).not.toContain('Constraints');
    expect(statement).not.toContain('nums.length');
  });
});

describe('extractExamples', () => {
  it('decodes html entities in explanation text', () => {
    const html = `
      <strong>Example 1:</strong>
      <pre><strong>Input:</strong> n = 2\n<strong>Output:</strong> [0,1,1]\n<strong>Explanation:</strong> 0 --&gt; 0 1 --&gt; 1 2 --&gt; 10</pre>
    `;

    const [example] = extractExamples(html);

    expect(example.input).toBe('n = 2');
    expect(example.output).toBe('[0,1,1]');
    expect(example.explanation).toContain('-->');
    expect(example.explanation).not.toContain('&gt;');
  });

  it('stops explanation before constraints and follow-up sections', () => {
    const html = `
      <strong>Example 1:</strong>
      <pre><strong>Input:</strong> n = 5\n<strong>Output:</strong> [0,1,1,2,1,2]\n<strong>Explanation:</strong> 0 --&gt; 0 1 --&gt; 1 2 --&gt; 10\n<strong>Constraints:</strong> 0 &lt;= n &lt;= 10^5\n<strong>Follow-up:</strong> Can you do this in O(n)?</pre>
    `;

    const [example] = extractExamples(html);

    expect(example.explanation).toContain('-->');
    expect(example.explanation).not.toContain('Constraints');
    expect(example.explanation).not.toContain('Follow-up');
  });
});

describe('extractConstraints', () => {
  it('extracts only constraint list items when heading has attributes', () => {
    const html = `
      <p>Description</p>
      <ul><li>example bullet that should not be included</li></ul>
      <strong class="example">Example 1:</strong>
      <pre><strong>Input:</strong> n = 2\n<strong>Output:</strong> 2</pre>
      <strong class="constraints">Constraints:</strong>
      <ul>
        <li>1 &lt;= n &lt;= 100</li>
        <li>n is odd.</li>
      </ul>
    `;

    expect(extractConstraints(html)).toEqual(['1 <= n <= 100', 'n is odd.']);
  });
});
