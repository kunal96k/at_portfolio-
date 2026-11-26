import test from 'node:test';
import assert from 'node:assert/strict';
import { createDebouncedTask, createThrottledTask } from './rateControl';

test('createDebouncedTask collapses rapid calls and only fires the final arguments', async () => {
  const calls: string[] = [];
  const debounced = createDebouncedTask((q: string) => calls.push(q), 35);

  debounced.run('r');
  debounced.run('rh');
  debounced.run('rhel');

  assert.deepEqual(calls, []);

  await new Promise((r) => setTimeout(r, 70));
  assert.deepEqual(calls, ['rhel']);

  debounced.flush('instant');
  assert.deepEqual(calls, ['rhel', 'instant']);
  debounced.cancel();
});

test('createThrottledTask fires immediately once per interval and preserves trailing call', async () => {
  const calls: string[] = [];
  const throttled = createThrottledTask((q: string) => calls.push(q), 50);

  throttled.run('first');
  throttled.run('second');
  throttled.run('third');

  // Immediate leading execution without firing bursts in between
  assert.deepEqual(calls, ['first']);

  await new Promise((r) => setTimeout(r, 85));
  // Trailing call captures the latest value once interval elapsed
  assert.deepEqual(calls, ['first', 'third']);
  throttled.cancel();
});
