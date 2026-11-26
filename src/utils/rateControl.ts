/**
 * Debounce and throttle utilities used to guard search and filter API requests.
 */

export interface ControlledTask<Args extends unknown[]> {
  run: (...args: Args) => void;
  flush: (...args: Args) => void;
  cancel: () => void;
}

/**
 * Delays invoking `fn` until `waitMs` milliseconds have elapsed since the last `run` call.
 * Calling `flush` cancels any pending timer and executes immediately.
 */
export function createDebouncedTask<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number = 320
): ControlledTask<Args> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const run = (...args: Args) => {
    cancel();
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, Math.max(0, waitMs));
  };

  const flush = (...args: Args) => {
    cancel();
    fn(...args);
  };

  return { run, flush, cancel };
}

/**
 * Ensures `fn` runs at most once per `intervalMs` window while preserving the
 * trailing call so the user's latest query or filter state is never dropped.
 */
export function createThrottledTask<Args extends unknown[]>(
  fn: (...args: Args) => void,
  intervalMs: number = 400
): ControlledTask<Args> {
  let lastInvokedAt = 0;
  let trailingTimer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Args | null = null;

  const clearTrailing = () => {
    if (trailingTimer !== null) {
      clearTimeout(trailingTimer);
      trailingTimer = null;
    }
  };

  const invoke = (args: Args) => {
    lastInvokedAt = Date.now();
    lastArgs = null;
    fn(...args);
  };

  const run = (...args: Args) => {
    const now = Date.now();
    const elapsed = now - lastInvokedAt;
    const wait = Math.max(0, intervalMs);

    if (lastInvokedAt === 0 || elapsed >= wait) {
      clearTrailing();
      invoke(args);
      return;
    }

    lastArgs = args;
    if (trailingTimer === null) {
      trailingTimer = setTimeout(() => {
        trailingTimer = null;
        if (lastArgs !== null) {
          invoke(lastArgs);
        }
      }, wait - elapsed);
    }
  };

  const flush = (...args: Args) => {
    clearTrailing();
    invoke(args);
  };

  const cancel = () => {
    clearTrailing();
    lastArgs = null;
  };

  return { run, flush, cancel };
}
