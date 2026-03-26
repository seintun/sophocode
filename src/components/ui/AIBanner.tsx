'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function AIBanner() {
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    async function checkAI() {
      try {
        const res = await fetch('/api/ai/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'ping',
            statement: 'ping',
            pattern: 'HASH_MAPS',
            difficulty: 'EASY',
          }),
        });
        if (res.status === 503 || res.status === 500) {
          setDegraded(true);
        }
      } catch {
        setDegraded(true);
      }
    }

    checkAI();
  }, []);

  if (!degraded) return null;

  return (
    <div
      role="alert"
      className={cn(
        'border-b border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-4 py-2',
        'text-center text-sm text-[var(--color-warning)]',
      )}
    >
      AI features temporarily unavailable. Code editor and test execution still work normally.
    </div>
  );
}

export default AIBanner;
