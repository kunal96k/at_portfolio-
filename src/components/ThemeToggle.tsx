import { motion } from 'motion/react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <div className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-30">
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={onToggle}
        className={`relative inline-flex h-7 w-[50px] items-center rounded-full p-1 transition-colors duration-300 shadow-[0_6px_20px_rgba(0,0,0,0.16)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          isDark
            ? 'bg-[#D0FF71] focus-visible:ring-[#D0FF71] focus-visible:ring-offset-[#1A1A1B]'
            : 'bg-[#5E67E6] focus-visible:ring-[#5E67E6] focus-visible:ring-offset-white'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 520, damping: 32 }}
          className={`inline-block h-5 w-5 rounded-full shadow-sm ${
            isDark ? 'translate-x-[22px] bg-[#1A1A1B]' : 'translate-x-0 bg-white'
          }`}
        />
      </button>
    </div>
  );
}
