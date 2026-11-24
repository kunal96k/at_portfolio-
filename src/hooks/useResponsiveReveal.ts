import { useEffect, useState } from 'react';
import { getScrollRevealConfig, type ScrollRevealConfig } from '../utils/scrollMath';

/**
 * Returns responsive whileInView reveal settings so sm and md viewports (< 1024px)
 * trigger immediately on scroll without late off-screen reveals, while lg+ desktop
 * retains its original reveal timing.
 */
export function useResponsiveReveal(lgAmount = 0.2, lgDuration = 0.6): ScrollRevealConfig {
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const onResize = () => {
      if (typeof window !== 'undefined') {
        setViewportWidth(window.innerWidth);
      }
    };
    onResize();
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return getScrollRevealConfig(viewportWidth, lgAmount, lgDuration);
}
