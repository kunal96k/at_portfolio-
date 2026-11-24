import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type { ToastItem } from '../types/admin';

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed top-16 right-3 left-3 z-[60] flex flex-col gap-2 sm:top-auto sm:right-5 sm:bottom-5 sm:left-auto sm:w-96 lg:bottom-6"
    >
      {toasts.map((toast) => {
        const toneStyles =
          toast.tone === 'success'
            ? {
                border: 'border-[#ABEFC6]',
                iconColor: 'text-[#027A48]',
                Icon: CheckCircle2,
              }
            : toast.tone === 'error'
              ? {
                  border: 'border-[#FECACA]',
                  iconColor: 'text-[#DC2626]',
                  Icon: AlertCircle,
                }
              : {
                  border: 'border-[#BFDBFE]',
                  iconColor: 'text-[#145BFF]',
                  Icon: Info,
                };

        const Icon = toneStyles.Icon;

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 shadow-lg ${toneStyles.border}`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${toneStyles.iconColor}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#0B1736]">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-[#475569]">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label={`Dismiss notification: ${toast.title}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F5F7FC] hover:text-[#0B1736]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
