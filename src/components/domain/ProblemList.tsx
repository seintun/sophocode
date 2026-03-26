'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import type { Difficulty, Pattern, MasteryState } from '@/generated/prisma/enums';

interface ProblemItem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  pattern: Pattern;
  testCaseCount: number;
  mastery: MasteryState | null;
}

const PATTERN_OPTIONS = [
  { value: '', label: 'All Patterns' },
  { value: 'HASH_MAPS', label: 'Hash Maps' },
  { value: 'ARRAYS_STRINGS', label: 'Arrays & Strings' },
  { value: 'TWO_POINTERS', label: 'Two Pointers' },
  { value: 'SLIDING_WINDOW', label: 'Sliding Window' },
  { value: 'BINARY_SEARCH', label: 'Binary Search' },
];

const DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];

const SORT_OPTIONS = [
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'pattern', label: 'Pattern' },
  { value: 'title', label: 'Title' },
];

function formatPattern(pattern: Pattern): string {
  return pattern
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
}

function difficultySortOrder(d: Difficulty): number {
  if (d === 'EASY') return 0;
  if (d === 'MEDIUM') return 1;
  return 2;
}

export default function ProblemList() {
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pattern, setPattern] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | ''>('');
  const [sortBy, setSortBy] = useState('difficulty');

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (pattern) params.set('pattern', pattern);
      if (difficultyFilter) params.set('difficulty', difficultyFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/problems?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch problems');

      const data: ProblemItem[] = await res.json();
      setProblems(data);
    } catch {
      setError('Failed to load problems. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [pattern, difficultyFilter, search]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const sorted = useMemo(() => {
    const copy = [...problems];
    if (sortBy === 'difficulty') {
      copy.sort((a, b) => difficultySortOrder(a.difficulty) - difficultySortOrder(b.difficulty));
    } else if (sortBy === 'pattern') {
      copy.sort((a, b) => a.pattern.localeCompare(b.pattern));
    } else {
      copy.sort((a, b) => a.title.localeCompare(b.title));
    }
    return copy;
  }, [problems, sortBy]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]">
        Practice Problems
      </h1>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="min-w-[200px] flex-1">
          <Input
            type="search"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={PATTERN_OPTIONS}
          value={pattern}
          onChange={(v) => setPattern(v)}
          className="w-44"
        />
        <Select options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} className="w-36" />
      </div>

      <div className="mb-6 flex gap-2">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => setDifficultyFilter(difficultyFilter === d ? '' : d)}
            className="cursor-pointer rounded-full transition-opacity"
            style={{ opacity: difficultyFilter === d || !difficultyFilter ? 1 : 0.4 }}
          >
            <Badge
              variant="difficulty"
              level={d === 'HARD' ? 'Hard' : d === 'MEDIUM' ? 'Medium' : 'Easy'}
            />
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="mb-3 text-[var(--color-error)]">{error}</p>
          <Button variant="secondary" onClick={fetchProblems}>
            Retry
          </Button>
        </div>
      ) : sorted.length === 0 ? (
        <p className="py-12 text-center text-[var(--color-text-muted)]">
          No problems match your filters.
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((problem) => (
            <Link key={problem.id} href={`/practice/${problem.slug}`} className="block">
              <Card className="flex items-center gap-4 transition-colors hover:bg-[var(--color-bg-elevated)]">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--color-text-primary)]">
                    {problem.title}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {problem.testCaseCount} test cases
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="pattern" label={formatPattern(problem.pattern)} />
                  <Badge
                    variant="difficulty"
                    level={
                      problem.difficulty === 'HARD'
                        ? 'Hard'
                        : problem.difficulty === 'MEDIUM'
                          ? 'Medium'
                          : 'Easy'
                    }
                  />
                  {problem.mastery && <Badge variant="mastery" state={problem.mastery} />}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
