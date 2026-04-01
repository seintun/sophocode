import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProgressPage from '../page';

vi.mock('next/dynamic', () => ({
  default: () => () => <div data-testid="pattern-heatmap" />,
}));

const progressResponse = {
  patternStats: [],
  needsRefresh: [],
  problemHistory: [
    {
      mastery: 'IN_PROGRESS',
      attemptCount: 3,
      solveCount: 1,
      lastAttemptedAt: '2026-03-30T00:00:00.000Z',
      latestSessionId: 'session-active-1',
      latestCompletedSessionId: null,
      sessionStatus: 'ACTIVE',
      problem: {
        id: 'problem-1',
        title: 'Two Sum',
        slug: 'two-sum',
        pattern: 'HASH_MAPS',
        difficulty: 'EASY',
      },
    },
    {
      mastery: 'NEEDS_REFRESH',
      attemptCount: 2,
      solveCount: 0,
      lastAttemptedAt: '2026-03-29T00:00:00.000Z',
      latestSessionId: 'session-abandoned-1',
      latestCompletedSessionId: null,
      sessionStatus: 'ABANDONED',
      problem: {
        id: 'problem-2',
        title: 'Valid Parentheses',
        slug: 'valid-parentheses',
        pattern: 'STACKS',
        difficulty: 'EASY',
      },
    },
    {
      mastery: 'MASTERED',
      attemptCount: 4,
      solveCount: 4,
      lastAttemptedAt: '2026-03-28T00:00:00.000Z',
      latestSessionId: null,
      latestCompletedSessionId: 'session-complete-1',
      sessionStatus: 'COMPLETED',
      problem: {
        id: 'problem-3',
        title: 'Merge Intervals',
        slug: 'merge-intervals',
        pattern: 'INTERVALS',
        difficulty: 'MEDIUM',
      },
    },
  ],
};

describe('ProgressPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(
      async () => ({ ok: true, json: async () => progressResponse }) as Response,
    ) as unknown as typeof fetch;
  });

  it('links ACTIVE and ABANDONED mastery badges to actionable pages', async () => {
    render(<ProgressPage />);

    const activeBadge = await screen.findByText('IN PROGRESS');
    expect(activeBadge.closest('a')).toHaveAttribute('href', '/session/session-active-1');

    const abandonedBadge = screen.getByText('ABANDONED');
    expect(abandonedBadge.closest('a')).toHaveAttribute('href', '/practice/valid-parentheses');

    const summaryLink = screen.getByRole('link', { name: 'VIEW SUMMARY' });
    expect(summaryLink).toHaveAttribute('href', '/session/session-complete-1/summary');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/progress', { cache: 'no-store' });
    });
  });

  it('shows confirm dialog and calls reset progress API', async () => {
    const user = userEvent.setup();
    render(<ProgressPage />);

    await screen.findByText('Problem History');

    await user.click(screen.getByRole('button', { name: 'Reset Progress' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Yes, Reset Progress' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/progress', {
        method: 'DELETE',
        cache: 'no-store',
      });
    });
  });
});
