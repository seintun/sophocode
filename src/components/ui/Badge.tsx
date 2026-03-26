'use client';

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const difficultyStyles = {
  Easy: 'bg-[var(--color-success)]/20 text-[var(--color-success)]',
  Medium: 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]',
  Hard: 'bg-[var(--color-error)]/20 text-[var(--color-error)]',
};

const masteryStyles = {
  UNSEEN: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]',
  IN_PROGRESS: 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]',
  MASTERED: 'bg-[var(--color-success)]/20 text-[var(--color-success)]',
  NEEDS_REFRESH: 'bg-[var(--color-error)]/20 text-[var(--color-error)]',
};

type BadgeVariant =
  | { variant: 'difficulty'; level: keyof typeof difficultyStyles }
  | { variant: 'pattern'; label: string }
  | { variant: 'mastery'; state: keyof typeof masteryStyles };

type BadgeProps = BadgeVariant &
  Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    className?: string;
  };

function Badge(props: BadgeProps) {
  const { className, ...variantProps } = props;

  let style: string;
  let label: string;

  if (variantProps.variant === 'difficulty') {
    style = difficultyStyles[variantProps.level];
    label = variantProps.level;
  } else if (variantProps.variant === 'pattern') {
    style = 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]';
    label = variantProps.label;
  } else {
    style = masteryStyles[variantProps.state];
    label = variantProps.state.replace(/_/g, ' ');
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}

export { Badge, difficultyStyles, masteryStyles };
export default Badge;
