import type { Difficulty, Pattern } from '@/generated/prisma/enums';
import type { LeetCodeTopicTag } from './graphql';

// Map LeetCode topic tags to our Pattern enum
// Uses heuristic matching on tag slugs
const TAG_TO_PATTERN: Record<string, Pattern> = {
  'hash-table': 'HASH_MAPS',
  'two-pointers': 'TWO_POINTERS',
  'sliding-window': 'SLIDING_WINDOW',
  'binary-search': 'BINARY_SEARCH',
  'linked-list': 'LINKED_LISTS',
  stack: 'STACKS_QUEUES',
  queue: 'STACKS_QUEUES',
  tree: 'TREES',
  'binary-tree': 'TREES',
  'binary-search-tree': 'TREES',
  graph: 'GRAPHS',
  'depth-first-search': 'GRAPHS',
  'breadth-first-search': 'GRAPHS',
  backtracking: 'RECURSION_BACKTRACKING',
  'dynamic-programming': 'DYNAMIC_PROGRAMMING',
  'heap-priority-queue': 'HEAPS',
  sorting: 'SORTING',
  greedy: 'GREEDY',
  trie: 'TRIES',
  'bit-manipulation': 'BIT_MANIPULATION',
  'string-matching': 'ARRAYS_STRINGS',
  array: 'ARRAYS_STRINGS',
  string: 'ARRAYS_STRINGS',
  matrix: 'ARRAYS_STRINGS',
  math: 'MATH_GEOMETRY',
  geometry: 'MATH_GEOMETRY',
  'prefix-sum': 'PREFIX_SUM',
  simulation: 'ARRAYS_STRINGS',
  enumeration: 'ARRAYS_STRINGS',
  'divide-and-conquer': 'DYNAMIC_PROGRAMMING',
  'monotonic-stack': 'STACKS_QUEUES',
  'topological-sort': 'GRAPHS',
  'union-find': 'GRAPHS',
  'shortest-path': 'ADVANCED_GRAPHS',
  'minimum-spanning-tree': 'ADVANCED_GRAPHS',
  'strongly-connected-component': 'ADVANCED_GRAPHS',
  'eulerian-circuit': 'ADVANCED_GRAPHS',
};

export function mapLeetCodeTagsToPattern(tags: LeetCodeTopicTag[]): Pattern {
  // Priority order: specific patterns first, then generic
  const priorityOrder = [
    'sliding-window',
    'binary-search',
    'two-pointers',
    'backtracking',
    'trie',
    'heap-priority-queue',
    'dynamic-programming',
    'greedy',
    'bit-manipulation',
    'prefix-sum',
    'linked-list',
    'tree',
    'binary-tree',
    'graph',
    'stack',
    'queue',
    'hash-table',
    'sorting',
    'topological-sort',
    'union-find',
    'shortest-path',
    'monotonic-stack',
    'divide-and-conquer',
  ];

  for (const slug of priorityOrder) {
    const tag = tags.find((t) => t.slug === slug);
    if (tag && TAG_TO_PATTERN[slug]) {
      return TAG_TO_PATTERN[slug];
    }
  }

  // Fallback: try any tag
  for (const tag of tags) {
    if (TAG_TO_PATTERN[tag.slug]) {
      return TAG_TO_PATTERN[tag.slug];
    }
  }

  return 'ARRAYS_STRINGS'; // Default fallback
}

export function mapDifficulty(d: string): Difficulty {
  switch (d.toUpperCase()) {
    case 'EASY':
      return 'EASY';
    case 'MEDIUM':
      return 'MEDIUM';
    case 'HARD':
      return 'HARD';
    default:
      return 'MEDIUM';
  }
}

export interface ParsedExample {
  input: string;
  output: string;
  explanation?: string;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Extract examples from LeetCode HTML content.
 * LeetCode content is HTML with example blocks.
 */
export function extractExamples(content: string): ParsedExample[] {
  const examples: ParsedExample[] = [];

  // Match <pre> blocks which contain examples
  const preBlocks = content.match(/<pre>[\s\S]*?<\/pre>/gi) || [];

  for (const block of preBlocks) {
    // Strip HTML tags for plain text
    const text = block
      .replace(/<\/?pre>/gi, '')
      .replace(/<strong>|<\/strong>/gi, '')
      .replace(/<code>|<\/code>/gi, '')
      .replace(/<em>|<\/em>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    // Try to extract Input/Output from the text
    const inputMatch = text.match(/Input[:\s]*([\s\S]*?)(?=Output|$)/i);
    const outputMatch = text.match(
      /Output[:\s]*([\s\S]*?)(?=Explanation|Constraints|Follow-up|Note|$)/i,
    );
    const explanationMatch = text.match(
      /Explanation[:\s]*([\s\S]*?)(?=\n\s*(?:Constraints|Follow-up|Note|Example\s*\d*\s*:?)|$)/i,
    );

    if (inputMatch && outputMatch) {
      examples.push({
        input: decodeHtmlEntities(inputMatch[1]).trim(),
        output: decodeHtmlEntities(outputMatch[1]).trim(),
        explanation: decodeHtmlEntities(explanationMatch?.[1] || '').trim() || undefined,
      });
    }
  }

  // Fallback: if no <pre> blocks, try to parse from plain text
  if (examples.length === 0) {
    const plainText = content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ');

    const exampleRegex = /Example\s*\d*[:\s]*\n([\s\S]*?)(?=Example\s*\d*[:\s]*\n|$)/gi;
    let match;
    while ((match = exampleRegex.exec(plainText)) !== null) {
      const section = match[1];
      const inp = section.match(/Input[:\s]*([\s\S]*?)(?=\nOutput)/i);
      const out = section.match(
        /Output[:\s]*([\s\S]*?)(?=\nExplanation|\nConstraints|\nFollow-up|\nNote|\nExample|$)/i,
      );
      const exp = section.match(
        /Explanation[:\s]*([\s\S]*?)(?=\n\s*(?:Constraints|Follow-up|Note|Example\s*\d*\s*:?)|$)/i,
      );
      if (inp && out) {
        examples.push({
          input: decodeHtmlEntities(inp[1]).trim(),
          output: decodeHtmlEntities(out[1]).trim(),
          explanation: decodeHtmlEntities(exp?.[1] || '').trim() || undefined,
        });
      }
    }
  }

  return examples;
}

/**
 * Extract problem statement (markdown) from LeetCode HTML content.
 * Strips examples and constraints sections.
 */
export function extractStatement(content: string): string {
  const sectionMarkers = [
    /<strong[^>]*>\s*Example\s*\d*\s*:?\s*<\/strong>/i,
    /<strong[^>]*>\s*Constraints\s*:?\s*<\/strong>/i,
    /<h\d[^>]*>\s*Example\s*\d*\s*:?\s*<\/h\d>/i,
    /<h\d[^>]*>\s*Constraints\s*:?\s*<\/h\d>/i,
  ];

  let trimmedContent = content;
  let cutIndex = -1;
  for (const marker of sectionMarkers) {
    const match = marker.exec(content);
    if (!match) continue;
    if (cutIndex === -1 || match.index < cutIndex) {
      cutIndex = match.index;
    }
  }

  if (cutIndex >= 0) {
    trimmedContent = content.slice(0, cutIndex);
  }

  // Convert HTML to rough markdown
  const md = trimmedContent
    .replace(/<pre>[\s\S]*?<\/pre>/gi, '') // Remove example blocks
    .replace(/<p>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<ul>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\bExample\s*\d*\s*:\s*/gi, '')
    .replace(/\bConstraints\s*:\s*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return decodeHtmlEntities(md);
}

export function extractConstraints(content: string): string[] {
  const constraintsSectionMatch = content.match(
    /<strong>\s*Constraints:\s*<\/strong>([\s\S]*?)(?:<strong>|<\/div>|$)/i,
  );

  const section = constraintsSectionMatch?.[1] ?? content;
  const listItems = Array.from(section.matchAll(/<li>([\s\S]*?)<\/li>/gi)).map((match) =>
    decodeHtmlEntities(match[1])
      .replace(/<[^>]+>/g, '')
      .trim(),
  );

  return listItems.filter(Boolean);
}

/**
 * Get Python code snippet from LeetCode code snippets.
 */
export function getPythonStarterCode(snippets: Array<{ langSlug: string; code: string }>): string {
  const python = snippets.find((s) => s.langSlug === 'python' || s.langSlug === 'python3');
  return python?.code || '';
}

/**
 * Build external URL from slug.
 */
export function buildExternalUrl(slug: string): string {
  return `https://leetcode.com/problems/${slug}/`;
}
