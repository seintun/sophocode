/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE } from '../route';
import { cookies } from 'next/headers';
import { getGuestIdFromCookie } from '@/lib/guest';
import { prisma } from '@/lib/db/prisma';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/lib/guest', () => ({
  getGuestIdFromCookie: vi.fn(),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    session: { deleteMany: vi.fn() },
    userProblemState: { deleteMany: vi.fn() },
    userProfile: { updateMany: vi.fn() },
  },
}));

describe('DELETE /api/progress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue({} as any);
  });

  it('returns 401 when guest id is missing', async () => {
    vi.mocked(getGuestIdFromCookie).mockReturnValue(null);

    const req = new NextRequest('http://localhost/api/progress', { method: 'DELETE' });
    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain('Unauthorized');
  });

  it('resets progress data for current guest', async () => {
    vi.mocked(getGuestIdFromCookie).mockReturnValue('guest-1');
    vi.mocked(prisma.session.deleteMany).mockReturnValue(
      Promise.resolve({ count: 2 } as any) as any,
    );
    vi.mocked(prisma.userProblemState.deleteMany).mockReturnValue(
      Promise.resolve({ count: 3 } as any) as any,
    );
    vi.mocked(prisma.userProfile.updateMany).mockReturnValue(
      Promise.resolve({ count: 1 } as any) as any,
    );
    vi.mocked(prisma.$transaction as any).mockResolvedValue([
      { count: 2 },
      { count: 3 },
      { count: 1 },
    ]);

    const req = new NextRequest('http://localhost/api/progress', { method: 'DELETE' });
    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(body).toEqual({
      deletedSessions: 2,
      deletedProblemStates: 3,
      updatedProfile: 1,
    });
  });
});
