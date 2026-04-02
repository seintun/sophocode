#!/usr/bin/env bun

import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { fetchLeetCodeProblem, fetchLeetCodeSlugByFrontendId } from '../src/lib/leetcode/graphql';
import {
  mapLeetCodeTagsToPattern,
  mapDifficulty,
  extractExamples,
  extractStatement,
  getPythonStarterCode,
  buildExternalUrl,
} from '../src/lib/leetcode/mappers';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function parseArgs(): { slug?: string; id?: string } {
  const args = process.argv.slice(2);
  const result: { slug?: string; id?: string } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) {
      result.slug = args[i + 1];
      i++;
    } else if (args[i] === '--id' && args[i + 1]) {
      result.id = args[i + 1];
      i++;
    }
  }

  return result;
}

async function main() {
  const { slug, id } = parseArgs();

  if (!slug && !id) {
    console.error('Usage: bun scripts/import-leetcode.ts --slug <problem-slug>');
    console.error('       bun scripts/import-leetcode.ts --id <leetcode-id>');
    process.exit(1);
  }

  if (slug && id) {
    console.error('Use either --slug or --id, not both.');
    process.exit(1);
  }

  let resolvedSlug = slug;

  if (!resolvedSlug && id) {
    const trimmedId = id.trim();
    if (!/^\d+$/.test(trimmedId)) {
      console.error(`Invalid --id value: ${id}. Expected a numeric LeetCode frontend ID.`);
      process.exit(1);
    }

    console.log(`Resolving LeetCode ID ${trimmedId} to slug...`);
    resolvedSlug = (await fetchLeetCodeSlugByFrontendId(trimmedId)) ?? undefined;

    if (!resolvedSlug) {
      console.error(
        `Could not resolve LeetCode ID ${trimmedId} to a slug. Try: bun scripts/import-leetcode.ts --slug <problem-slug>`,
      );
      process.exit(1);
    }

    console.log(`  Found slug: ${resolvedSlug}`);
  }

  if (!resolvedSlug) {
    console.error('Failed to determine problem slug for import.');
    process.exit(1);
  }

  console.log(`Fetching LeetCode problem: ${resolvedSlug}...`);

  const question = await fetchLeetCodeProblem(resolvedSlug);
  console.log(`  Found: ${question.title} (LC #${question.questionFrontendId})`);

  const pattern = mapLeetCodeTagsToPattern(question.topicTags);
  const difficulty = mapDifficulty(question.difficulty);
  const examples = extractExamples(question.content);
  const statement = extractStatement(question.content);
  const starterCode = getPythonStarterCode(question.codeSnippets);
  const leetcodeNumber = parseInt(question.questionFrontendId, 10);
  const externalUrl = buildExternalUrl(resolvedSlug);

  // Upsert problem
  const problem = await prisma.problem.upsert({
    where: { slug: resolvedSlug },
    create: {
      title: question.title,
      slug: resolvedSlug,
      difficulty,
      pattern,
      tags: question.topicTags.map((t) => t.name),
      constraints: question.constraints || [],
      sourceType: 'EXTERNAL',
      leetcodeNumber,
      externalUrl,
      statement,
      examples: examples as any,
      starterCode,
      isCurated: false,
    },
    update: {
      title: question.title,
      difficulty,
      pattern,
      tags: question.topicTags.map((t) => t.name),
      constraints: question.constraints || [],
      leetcodeNumber,
      externalUrl,
      statement,
      examples: examples as any,
      starterCode,
    },
  });

  console.log(`  ✓ Problem upserted: ${problem.id}`);

  // Upsert visible test cases from examples
  for (let i = 0; i < examples.length; i++) {
    const example = examples[i];
    const existing = await prisma.testCase.findFirst({
      where: { problemId: problem.id, order: i + 1 },
    });

    if (existing) {
      await prisma.testCase.update({
        where: { id: existing.id },
        data: { input: example.input, expected: example.output },
      });
    } else {
      await prisma.testCase.create({
        data: {
          problemId: problem.id,
          input: example.input,
          expected: example.output,
          isHidden: false,
          order: i + 1,
        },
      });
    }
  }
  console.log(`  ✓ ${examples.length} test cases upserted`);

  // Upsert problem hints
  for (let i = 0; i < question.hints.length && i < 3; i++) {
    await prisma.problemHint.upsert({
      where: { problemId_level: { problemId: problem.id, level: i + 1 } },
      create: {
        problemId: problem.id,
        level: i + 1,
        content: question.hints[i],
        source: 'leetcode',
      },
      update: {
        content: question.hints[i],
      },
    });
  }
  console.log(`  ✓ ${Math.min(question.hints.length, 3)} hints upserted`);

  console.log(`\nDone! Imported: ${question.title} (LC #${leetcodeNumber})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
