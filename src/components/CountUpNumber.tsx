import { useEffect, useRef, useState } from 'react';
import { formatCounterValue } from '../utils/scrollMath';

interface CountUpNumberProps {
  target: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

export function CountUpNumber({
  target,
  suffix = '',
  durationMs = 1100,
  className = '',
}: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(formatCounterValue(target, target, suffix));
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplay(formatCounterValue(target, target, suffix));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const startTime = performance.now();
            const tick = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / durationMs, 1);
              // Cubic ease out
              const eased = 1 - Math.pow(1 - progress, 3);
              setDisplay(formatCounterValue(eased * target, target, suffix));
              if (progress < 1) {
                requestAnimationFrame(tick);
              }
            };
            setDisplay(formatCounterValue(0, target, suffix));
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix, durationMs]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {display}
    </span>
  );
}
