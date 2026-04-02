import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('recommendation-cache', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns null when Redis client is unavailable', async () => {
    vi.doMock('@upstash/redis', () => ({
      Redis: {
        fromEnv: () => {
          throw new Error('missing env');
        },
      },
    }));

    const { getCachedRecommendation, setCachedRecommendation, invalidateRecommendation } =
      await import('../recommendation-cache');

    await expect(getCachedRecommendation('guest-1')).resolves.toBeNull();
    await expect(
      setCachedRecommendation('guest-1', {
        problemId: 'p1',
        slug: 'two-sum',
        title: 'Two Sum',
        pattern: 'HASH_MAPS',
        difficulty: 'EASY',
        reason: 'Recommended',
      }),
    ).resolves.toBeUndefined();
    await expect(invalidateRecommendation('guest-1')).resolves.toBeUndefined();
  });

  it('reads, writes, and invalidates cache through Redis client', async () => {
    const get = vi.fn().mockResolvedValue({
      problemId: 'p1',
      slug: 'two-sum',
      title: 'Two Sum',
      pattern: 'HASH_MAPS',
      difficulty: 'EASY',
      reason: 'Recommended',
    });
    const set = vi.fn().mockResolvedValue('OK');
    const del = vi.fn().mockResolvedValue(1);

    vi.doMock('@upstash/redis', () => ({
      Redis: {
        fromEnv: () => ({ get, set, del }),
      },
    }));

    const { getCachedRecommendation, setCachedRecommendation, invalidateRecommendation } =
      await import('../recommendation-cache');

    const cached = await getCachedRecommendation('guest-1');
    expect(cached?.slug).toBe('two-sum');

    await setCachedRecommendation('guest-1', {
      problemId: 'p2',
      slug: 'longest-substring',
      title: 'Longest Substring',
      pattern: 'SLIDING_WINDOW',
      difficulty: 'MEDIUM',
      reason: 'Recommended',
    });
    await invalidateRecommendation('guest-1');

    expect(get).toHaveBeenCalledWith('recommendation:guest-1');
    expect(set).toHaveBeenCalledWith(
      'recommendation:guest-1',
      expect.objectContaining({ slug: 'longest-substring' }),
      { ex: 3600 },
    );
    expect(del).toHaveBeenCalledWith('recommendation:guest-1');
  });
});
