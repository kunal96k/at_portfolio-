import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { WavingHandIcon } from './SocialIcons';

interface HiBadgeProps {
  size?: 'lg' | 'md';
  initialMode?: 'hi' | 'wave';
  className?: string;
}

export function HiBadge({ size = 'lg', initialMode = 'hi', className = '' }: HiBadgeProps) {
  const [showWave, setShowWave] = useState(initialMode === 'wave');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setShowWave((prev) => !prev);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  const dims = size === 'lg' ? 'w-24 h-24 sm:w-[116px] sm:h-[116px]' : 'w-20 h-20 sm:w-24 sm:h-24';

  return (
    <motion.div
      whileHover={{ scale: 1.07 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      className={`${dims} rounded-full bg-[#4F58DF] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] flex items-center justify-center shadow-[0_12px_32px_rgba(79,88,223,0.28)] dark:shadow-[0_12px_32px_rgba(208,255,113,0.22)] select-none ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        {showWave ? (
          <motion.div
            key="wave"
            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: [0, 16, -12, 14, -6, 0],
            }}
            exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <WavingHandIcon className={size === 'lg' ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-9 h-9'} />
          </motion.div>
        ) : (
          <motion.span
            key="hi"
            initial={{ opacity: 0, scale: 0.7, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-[32px] sm:text-[40px] font-normal leading-none tracking-tight"
          >
            Hi
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
