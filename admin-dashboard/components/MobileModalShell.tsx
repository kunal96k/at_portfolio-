import { X } from 'lucide-react';
import { useEffect, type FormEvent, type ReactNode } from 'react';

let openModalCount = 0;

function lockBodyScroll() {
  openModalCount += 1;
  if (openModalCount === 1 && typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden';
  }
}

function unlockBodyScroll() {
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0 && typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
}

interface MobileModalShellProps {
  open: boolean;
  title: string;
  subtitle?: string;
  headerBadge?: ReactNode;
  titleId: string;
  maxWidthClass?: string;
  busy?: boolean;
  onClose: () => void;
  asForm?: boolean;
  onFormSubmit?: (e: FormEvent) => void;
  footer?: ReactNode;
  children: ReactNode;
}

export function MobileModalShell({
  open,
  title,
  subtitle,
  headerBadge,
  titleId,
  maxWidthClass = 'sm:max-w-2xl',
  busy = false,
  onClose,
  asForm = false,
  onFormSubmit,
  footer,
  children,
}: MobileModalShellProps) {
  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      unlockBodyScroll();
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  const panelClasses = `relative z-10 flex w-full ${maxWidthClass} max-h-[92dvh] sm:max-h-[88dvh] flex-col overflow-hidden rounded-t-3xl border border-[#CBD5E1] bg-white shadow-2xl sm:rounded-2xl`;

  const innerContent = (
    <>
      {/* Mobile Grab Handle */}
      <div className="flex shrink-0 justify-center pt-2.5 pb-1 sm:hidden">
        <div className="h-1.5 w-10 rounded-full bg-[#CBD5E1]" />
      </div>

      {/* Fixed Header */}
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E2E8F0] px-4 py-3 sm:items-center sm:px-6 sm:py-3.5 bg-white">
        <div className="min-w-0 flex-1">
          {headerBadge && <div className="mb-1 flex flex-wrap items-center gap-1.5">{headerBadge}</div>}
          <h2
            id={titleId}
            className="truncate text-[15px] sm:text-base font-bold text-[#0F172A]"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs leading-relaxed text-[#64748B]">
              {subtitle}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label={`Close ${title}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] disabled:opacity-50"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Scrollable Body (min-h-0 + overscroll-contain + touch-pan-y guarantees smooth mobile scroll) */}
      <div
        data-testid="modal-scroll-body"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y p-4 sm:p-5 sm:px-6 admin-scroll"
      >
        {children}
      </div>

      {/* Fixed Sticky Footer with guaranteed bottom clearance so buttons never touch container bottom edge */}
      {footer && (
        <div className="shrink-0 border-t border-[#E2E8F0] bg-[#FAFAFC] px-4 pt-3.5 pb-4.5 sm:px-6 sm:pt-3.5 sm:pb-5">
          {footer}
        </div>
      )}
    </>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Clickable Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => {
          if (!busy) onClose();
        }}
        className="fixed inset-0 bg-[#0B1736]/60 backdrop-blur-[1px]"
      />

      {asForm ? (
        <form
          noValidate
          onSubmit={onFormSubmit}
          className={panelClasses}
        >
          {innerContent}
        </form>
      ) : (
        <div className={panelClasses}>{innerContent}</div>
      )}
    </div>
  );
}
