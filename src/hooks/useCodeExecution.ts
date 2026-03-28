'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { runTests, terminateWorker, type TestCase, type RunResult } from '@/lib/execution/runner';

export { type TestCase, type RunResult } from '@/lib/execution/runner';

export function useCodeExecution() {
  const [results, setResults] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      terminateWorker();
    };
  }, []);

  const run = useCallback(async (code: string, testCases: TestCase[]) => {
    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      const result = await runTests(code, testCases);
      if (mountedRef.current) {
        setResults(result);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Execution failed');
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setIsRunning(false);
      }
    }
  }, []);

  return { run, results, isRunning, error };
}
