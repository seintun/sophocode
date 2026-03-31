import { useState, useEffect, useRef } from 'react';

const DEBOUNCE_MS = 100;

interface UseExplanationCacheReturn {
  cachedText: string;
  isFromCache: boolean;
}

export function useExplanationCache(
  key: string,
  stream: { text: string; isLoading: boolean } | undefined,
): UseExplanationCacheReturn {
  const [cachedText, setCachedText] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem(`sophia-explanation:${key}`) ?? '';
    } catch {
      return '';
    }
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced localStorage write when stream completes
  useEffect(() => {
    if (!stream) return;

    const { text, isLoading } = stream;

    // Clear pending write
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Only write when loading finishes and we have content
    if (!isLoading && text) {
      timeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(`sophia-explanation:${key}`, text);
        } catch {
          // Quota exceeded or read-only - fail silently
        }
        setCachedText(text);
      }, DEBOUNCE_MS);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stream, stream?.text, stream?.isLoading, key]);

  return {
    cachedText,
    isFromCache: Boolean(cachedText && !stream?.isLoading && stream?.text !== cachedText),
  };
}
