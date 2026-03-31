'use client';

import { memo } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface StreamedMarkdownMessageProps {
  content: string;
  accentColor?: string;
  compact?: boolean;
  isStreaming?: boolean;
  cursorColor?: string;
  className?: string;
}

/**
 * Wrapper around MarkdownRenderer that adds a streaming cursor when content is being streamed.
 * Fully memoized to prevent unnecessary re-renders during streaming.
 */
export const StreamedMarkdownMessage = memo(function StreamedMarkdownMessage({
  content,
  accentColor,
  compact = false,
  isStreaming = false,
  cursorColor,
  className = '',
}: StreamedMarkdownMessageProps) {
  const cursorStyle = cursorColor ? { backgroundColor: cursorColor } : undefined;

  return (
    <div className={className}>
      <MarkdownRenderer content={content} accentColor={accentColor} compact={compact} />
      {isStreaming && <span className="sophia-cursor" style={cursorStyle} aria-hidden="true" />}
    </div>
  );
});

StreamedMarkdownMessage.displayName = 'StreamedMarkdownMessage';
