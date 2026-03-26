'use client';

import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcutHandlers {
  onRunTests?: () => void;
  onGetHint?: () => void;
}

export function useKeyboardShortcuts({ onRunTests, onGetHint }: KeyboardShortcutHandlers) {
  const handlersRef = useRef({ onRunTests, onGetHint });

  useEffect(() => {
    handlersRef.current = { onRunTests, onGetHint };
  }, [onRunTests, onGetHint]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const meta = e.metaKey || e.ctrlKey;

    if (meta && e.key === 'Enter') {
      e.preventDefault();
      handlersRef.current.onRunTests?.();
    }

    if (meta && e.key === 'h') {
      e.preventDefault();
      handlersRef.current.onGetHint?.();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
