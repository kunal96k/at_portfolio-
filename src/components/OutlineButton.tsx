import type { ReactNode } from 'react';

interface OutlineButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function OutlineButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  ariaLabel,
}: OutlineButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-8 py-2.5 sm:px-10 sm:py-3 font-display text-[22px] sm:text-[24px] font-bold uppercase tracking-normal text-[#5E67E6] dark:text-[#D0FF71] transition-colors duration-300 hover:bg-[#5E67E6] hover:text-white dark:hover:bg-[#D0FF71] dark:hover:text-[#1A1A1B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1A1A1B] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${className}`}
    >
      <span className="relative z-10 inline-block transition-transform duration-300 group-hover:scale-[1.03]">
        {children}
      </span>
    </button>
  );
}
