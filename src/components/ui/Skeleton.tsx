'use client';

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-[var(--color-bg-elevated)]', className)}
      {...rest}
    />
  );
}

export { Skeleton };
export default Skeleton;
