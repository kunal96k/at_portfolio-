import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createDebouncedTask,
  createThrottledTask,
} from '../utils/rateControl';

interface UseDebouncedThrottledSearchOptions {
  debounceMs?: number;
  throttleMs?: number;
}

/**
 * Coordinates debounced typing + throttled search emission so rapid typing waits
 * `debounceMs` and consecutive search commits respect a `throttleMs` ceiling.
 */
export function useDebouncedThrottledSearch(
  rawValue: string,
  options: UseDebouncedThrottledSearchOptions = {}
) {
  const debounceMs = options.debounceMs ?? 320;
  const throttleMs = options.throttleMs ?? 400;

  const [committedValue, setCommittedValue] = useState(rawValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const throttlerRef = useRef(
    createThrottledTask<[string]>((nextValue: string) => {
      setCommittedValue(nextValue);
      setIsDebouncing(false);
    }, throttleMs)
  );

  const debouncerRef = useRef(
    createDebouncedTask<[string]>((nextValue: string) => {
      throttlerRef.current.run(nextValue);
    }, debounceMs)
  );

  useEffect(() => {
    const throttleTask = createThrottledTask<[string]>((nextValue: string) => {
      setCommittedValue(nextValue);
      setIsDebouncing(false);
    }, throttleMs);

    const debounceTask = createDebouncedTask<[string]>((nextValue: string) => {
      throttleTask.run(nextValue);
    }, debounceMs);

    throttlerRef.current = throttleTask;
    debouncerRef.current = debounceTask;

    return () => {
      debounceTask.cancel();
      throttleTask.cancel();
    };
  }, [debounceMs, throttleMs]);

  useEffect(() => {
    if (rawValue === committedValue) {
      setIsDebouncing(false);
      debouncerRef.current.cancel();
      return;
    }
    setIsDebouncing(true);
    debouncerRef.current.run(rawValue);
  }, [rawValue, committedValue]);

  const flushNow = useCallback((overrideValue?: string) => {
    const target = overrideValue !== undefined ? overrideValue : rawValue;
    debouncerRef.current.cancel();
    throttlerRef.current.flush(target);
  }, [rawValue]);

  return {
    committedValue,
    isDebouncing,
    flushNow,
  };
}
