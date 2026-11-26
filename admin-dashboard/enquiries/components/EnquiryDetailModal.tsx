import {
  Archive,
  CheckCircle2,
  Clock,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  Save,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { MobileModalShell } from '../../components/MobileModalShell';
import { StatusBadge } from '../../components/StatusBadge';
import type { ContactEnquiryItem, EnquiryStatus } from '../types/enquiry';

interface EnquiryDetailModalProps {
  enquiry: ContactEnquiryItem | null;
  submitting: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    payload: { status: EnquiryStatus; adminNotes: string }
  ) => Promise<void>;
}

const STATUS_OPTIONS: EnquiryStatus[] = ['New', 'Read', 'Replied', 'Archived'];

export function EnquiryDetailModal({
  enquiry,
  submitting,
  onClose,
  onSave,
}: EnquiryDetailModalProps) {
  const [status, setStatus] = useState<EnquiryStatus>('New');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (enquiry) {
      setStatus(enquiry.status);
      setAdminNotes(enquiry.adminNotes ?? '');
    }
  }, [enquiry]);

  if (!enquiry) return null;

  const handleSave = async (nextStatus?: EnquiryStatus) => {
    await onSave(enquiry.id, {
      status: nextStatus ?? status,
      adminNotes: adminNotes.trim(),
    });
  };

  return (
    <MobileModalShell
      open={Boolean(enquiry)}
      title={enquiry.name}
      subtitle={`${enquiry.channel}${enquiry.sourcePage ? ` · ${enquiry.sourcePage}` : ''}`}
      titleId="enquiry-detail-modal-title"
      onClose={onClose}
      headerBadge={
        <>
          <StatusBadge status={status} />
          {enquiry.service && (
            <span className="rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#145BFF]">
              {enquiry.service}
            </span>
          )}
        </>
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {enquiry.status !== 'Replied' && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleSave('Replied')}
                className="inline-flex h-[40px] items-center gap-1.5 rounded-lg border border-[#ABEFC6] bg-[#ECFDF3] px-3.5 text-xs font-semibold text-[#027A48] hover:bg-[#D1FAE5] disabled:opacity-60"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Save &amp; Mark Replied</span>
              </button>
            )}
            {enquiry.status !== 'Archived' && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleSave('Archived')}
                className="inline-flex h-[40px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-60"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Archive</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={onClose}
              className="h-[40px] rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC]"
            >
              Close
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSave()}
              className="inline-flex h-[40px] items-center justify-center gap-1.5 rounded-lg bg-[#145BFF] px-5 text-[13px] font-semibold text-white shadow-xs hover:bg-[#0F4AD6] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? 'Saving…' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Contact Details Grid */}
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
              Email Address
            </p>
            <a
              href={`mailto:${enquiry.email}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#145BFF] hover:underline break-all"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span>{enquiry.email}</span>
            </a>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
              Phone / WhatsApp
            </p>
            {enquiry.phone ? (
              <a
                href={`tel:${enquiry.phone}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1736] hover:text-[#145BFF] tabular-nums"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#145BFF]" />
                <span>{enquiry.phone}</span>
              </a>
            ) : (
              <p className="text-sm text-[#64748B]">Not provided</p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
              Source Page &amp; Channel
            </p>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#334155]">
              <Globe className="h-3.5 w-3.5 text-[#64748B]" />
              <span>
                {enquiry.channel}
                {enquiry.sourcePage ? ` (${enquiry.sourcePage})` : ''}
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
              Submitted Timestamp
            </p>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#334155] tabular-nums">
              <Clock className="h-3.5 w-3.5 text-[#64748B]" />
              <span>{enquiry.createdAt || '—'}</span>
            </p>
          </div>
        </div>

        {/* Learner Message */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
            <MessageSquare className="h-3.5 w-3.5 text-[#145BFF]" />
            <span>Submitted Enquiry Message</span>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#0B1736]">
            {enquiry.message || 'No additional message included.'}
          </p>
        </div>

        {/* Status & Admin Follow-Up Notes */}
        <div className="space-y-4 rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <div>
            <p className="text-xs font-semibold text-[#0B1736]">
              Lead Progress Status
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STATUS_OPTIONS.map((opt) => {
                const selected = status === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setStatus(opt)}
                    className={`h-[38px] rounded-xl border text-xs font-semibold transition-colors ${
                      selected
                        ? 'border-[#145BFF] bg-[#EFF6FF] text-[#145BFF]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="enquiry-admin-notes"
              className="block text-xs font-semibold text-[#0B1736]"
            >
              Internal Follow-Up Notes
            </label>
            <textarea
              id="enquiry-admin-notes"
              rows={3}
              maxLength={1500}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Log call summary, WhatsApp follow-up, preferred batch timing, or fee quote shared…"
              className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
            />
            <p className="mt-1 text-right text-[11px] text-[#64748B] tabular-nums">
              {adminNotes.length}/1500
            </p>
          </div>
        </div>
      </div>
    </MobileModalShell>
  );
}
