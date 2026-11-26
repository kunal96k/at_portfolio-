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
  fullScreen?: boolean;
  busy?: boolean;
  onClose: () => void;
  asForm?: boolean;
  onFormSubmit?: (e: FormEvent) => void;
  footer?: ReactNode;
  children: ReactNode;
}

const escapeModalStack: symbol[] = [];

export function MobileModalShell({
  open,
  title,
  subtitle,
  headerBadge,
  titleId,
  maxWidthClass = 'sm:max-w-2xl',
  fullScreen = false,
  busy = false,
  onClose,
  asForm = false,
  onFormSubmit,
  footer,
  children,
}: MobileModalShellProps) {
  useEffect(() => {
    if (!open) return;
    const modalToken = Symbol(titleId);
    escapeModalStack.push(modalToken);
    lockBodyScroll();

    const onKeyDown = (e: KeyboardEvent) => {
      const topToken = escapeModalStack[escapeModalStack.length - 1];
      if (e.key === 'Escape' && !busy && topToken === modalToken) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      const idx = escapeModalStack.lastIndexOf(modalToken);
      if (idx !== -1) escapeModalStack.splice(idx, 1);
      window.removeEventListener('keydown', onKeyDown);
      unlockBodyScroll();
    };
  }, [open, busy, onClose, titleId]);

  if (!open) return null;

  const panelClasses = fullScreen
    ? 'relative z-10 flex h-full w-full flex-col overflow-hidden bg-white'
    : `relative z-10 flex w-full ${maxWidthClass} max-h-[92dvh] sm:max-h-[88dvh] flex-col overflow-hidden rounded-t-3xl border border-[#CBD5E1] bg-white shadow-2xl sm:rounded-2xl`;

  const innerContent = (
    <>
      {/* Mobile Grab Handle (standard sheet modals only) */}
      {!fullScreen && (
        <div className="flex shrink-0 justify-center pt-2.5 pb-1 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-[#CBD5E1]" />
        </div>
      )}

      {/* Fixed Header */}
      <div
        className={`shrink-0 border-b border-[#E2E8F0] bg-white ${fullScreen ? 'px-4 py-3.5 sm:px-8 sm:py-4' : 'px-4 py-3 sm:px-6 sm:py-3.5'
          }`}
      >
        <div
          className={`flex items-start justify-between gap-3 sm:items-center ${fullScreen ? 'mx-auto w-full max-w-6xl' : 'w-full'
            }`}
        >
          <div className="min-w-0 flex-1">
            {headerBadge && (
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                {headerBadge}
              </div>
            )}
            <h2
              id={titleId}
              className={`truncate font-bold text-[#0F172A] ${fullScreen ? 'text-base sm:text-lg' : 'text-[15px] sm:text-base'
                }`}
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
            className={`flex shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] disabled:opacity-50 ${fullScreen
              ? 'h-9 gap-1.5 border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-semibold'
              : 'h-9 w-9'
              }`}
          >
            <X className="h-4.5 w-4.5" />
            {fullScreen && <span className="hidden sm:inline">Close</span>}
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div
        data-testid="modal-scroll-body"
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y admin-scroll ${fullScreen
          ? 'bg-[#F5F7FC] p-4 sm:px-8 sm:py-6'
          : 'p-4 sm:p-5 sm:px-6'
          }`}
      >
        <div className={fullScreen ? 'mx-auto w-full max-w-6xl' : undefined}>
          {children}
        </div>
      </div>

      {/* Fixed Sticky Footer with generous bottom clearance */}
      {footer && (
        <div
          style={{
            paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
          }}
          className={`shrink-0 border-t border-[#E2E8F0] bg-[#FAFAFC] ${fullScreen
            ? 'px-4 pt-4 sm:px-8 sm:pt-5'
            : 'px-4 pt-3.5 sm:px-6 sm:pt-4'
            }`}
        >
          <div className={fullScreen ? 'mx-auto w-full max-w-6xl' : undefined}>
            {footer}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div
      className={
        fullScreen
          ? 'fixed inset-0 z-50 flex flex-col bg-white'
          : 'fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4'
      }
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Clickable Backdrop (for non-fullscreen dialogs) */}
      {!fullScreen && (
        <div
          aria-hidden="true"
          onClick={() => {
            if (!busy) onClose();
          }}
          className="fixed inset-0 bg-[#0B1736]/60 backdrop-blur-[1px]"
        />
      )}

      {asForm ? (
        <form noValidate onSubmit={onFormSubmit} className={panelClasses}>
          {innerContent}
        </form>
      ) : (
        <div className={panelClasses}>{innerContent}</div>
      )}
    </div>
  );
}
