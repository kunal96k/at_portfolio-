import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const LINE_CLAMP_CLASSES: Record<2 | 3 | 4, string> = {
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
};

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Observes a clamped text element and reports whether its content visually
 * overflows the line-clamp box on the current viewport.
 */
export function useIsTruncated<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  text: string,
  lines: 2 | 3 | 4
): boolean {
  const [isTruncated, setIsTruncated] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setIsTruncated(el.scrollHeight > el.clientHeight + 2);
  }, [ref]);

  useIsomorphicLayoutEffect(() => {
    measure();
  }, [measure, text, lines]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frameId = 0;
    const scheduleMeasure = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(measure);
    };

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(scheduleMeasure)
        : null;
    observer?.observe(el);

    window.addEventListener('resize', scheduleMeasure);
    document.fonts?.ready?.then(scheduleMeasure).catch(() => {});

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      observer?.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, [ref, measure]);

  return isTruncated;
}

interface TruncatedTextWithMoreProps {
  text: string;
  lines?: 2 | 3 | 4;
  as?: 'p' | 'blockquote';
  prefix?: string;
  suffix?: string;
  className?: string;
  buttonClassName?: string;
  moreLabel?: string;
  ariaLabel?: string;
  onMore?: () => void;
  asSpanTrigger?: boolean;
}

/**
 * Renders line-clamped text so grid cards keep uniform height, and reveals a
 * "More" trigger whenever the content overflows on screen.
 */
export function TruncatedTextWithMore({
  text,
  lines = 3,
  as = 'p',
  prefix = '',
  suffix = '',
  className = '',
  buttonClassName = 'mt-1.5 inline-flex items-center gap-1 text-[13px] font-medium text-[#5E67E6] dark:text-[#D0FF71] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71] rounded cursor-pointer',
  moreLabel = 'More',
  ariaLabel,
  onMore,
  asSpanTrigger = false,
}: TruncatedTextWithMoreProps) {
  const elRef = useRef<HTMLElement | null>(null);
  const isTruncated = useIsTruncated(elRef, text, lines);
  const clampClass = LINE_CLAMP_CLASSES[lines];

  const content = (
    <>
      {prefix}
      {text}
      {suffix}
    </>
  );

  return (
    <div>
      {as === 'blockquote' ? (
        <blockquote
          ref={elRef as React.RefObject<HTMLQuoteElement | null>}
          className={`${clampClass} ${className}`}
        >
          {content}
        </blockquote>
      ) : (
        <p
          ref={elRef as React.RefObject<HTMLParagraphElement | null>}
          className={`${clampClass} ${className}`}
        >
          {content}
        </p>
      )}

      {isTruncated &&
        (asSpanTrigger ? (
          <span className={buttonClassName}>{moreLabel}</span>
        ) : onMore ? (
          <button
            type="button"
            aria-label={ariaLabel || moreLabel}
            onClick={(e) => {
              e.stopPropagation();
              onMore();
            }}
            className={buttonClassName}
          >
            <span>{moreLabel}</span>
          </button>
        ) : null)}
    </div>
  );
}
