import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

interface PublicDetailModalProps {
  open: boolean;
  onClose: () => void;
  titleId: string;
  closeLabel?: string;
  maxWidthClass?: string;
  children: ReactNode;
}

/**
 * Portal-rendered accessible modal dialog for viewing full card details
 * (testimonials, batch synopses, blog summaries, domains, and gallery highlights)
 * without expanding grid card dimensions.
 */
export function PublicDetailModal({
  open,
  onClose,
  titleId,
  closeLabel = 'Close detail dialog',
  maxWidthClass = 'max-w-[680px]',
  children,
}: PublicDetailModalProps) {
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`relative flex max-h-[86vh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1E1E1F]`}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-[#303030] transition-colors hover:bg-black/20 dark:bg-white/15 dark:text-white dark:hover:bg-white/25 cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
