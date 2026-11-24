import { AlertTriangle } from 'lucide-react';
import { MobileModalShell } from './MobileModalShell';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <MobileModalShell
      open={open}
      title={title}
      titleId="confirm-dialog-title"
      maxWidthClass="sm:max-w-md"
      busy={busy}
      onClose={onCancel}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1736] transition-colors hover:bg-[#F5F7FC] disabled:opacity-50 sm:w-auto"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`min-h-[44px] w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 sm:w-auto ${
              destructive
                ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                : 'bg-[#145BFF] hover:bg-[#0F4AD6]'
            }`}
          >
            {busy ? 'Processing…' : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            destructive
              ? 'bg-[#FEF2F2] text-[#DC2626]'
              : 'bg-[#EFF6FF] text-[#145BFF]'
          }`}
        >
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm leading-relaxed text-[#475569]">{description}</p>
      </div>
    </MobileModalShell>
  );
}
