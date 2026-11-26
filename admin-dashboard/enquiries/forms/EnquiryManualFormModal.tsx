import { useEffect, useState, type FormEvent } from 'react';
import {
  containsDangerousMarkup,
  isValidEmail,
  isValidPhone,
  PUBLIC_INPUT_LIMITS,
  sanitizePhoneInput,
} from '../../../src/utils/scrollMath';
import { MobileModalShell } from '../../components/MobileModalShell';
import type { EnquiryStatus, ManualEnquiryPayload } from '../types/enquiry';

interface EnquiryManualFormModalProps {
  open: boolean;
  submitting: boolean;
  courseSuggestions: string[];
  onClose: () => void;
  onSubmit: (payload: ManualEnquiryPayload) => Promise<void>;
}

const CHANNEL_OPTIONS = [
  'Phone Call',
  'WhatsApp',
  'Walk-in / Reference',
  'Email Direct',
];

export function EnquiryManualFormModal({
  open,
  submitting,
  courseSuggestions,
  onClose,
  onSubmit,
}: EnquiryManualFormModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [channel, setChannel] = useState('Phone Call');
  const [status, setStatus] = useState<EnquiryStatus>('New');
  const [message, setMessage] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName('');
    setEmail('');
    setPhone('');
    setService(courseSuggestions[0] ?? 'Corporate / Institutional Training');
    setChannel('Phone Call');
    setStatus('New');
    setMessage('');
    setAdminNotes('');
    setError(null);
  }, [open, courseSuggestions]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanMessage = message.trim();
    const cleanNotes = adminNotes.trim();

    if (cleanName.length < 2 || containsDangerousMarkup(cleanName)) {
      setError('Please enter a valid name (2–120 chars, no < or >).');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (cleanPhone && !isValidPhone(cleanPhone)) {
      setError('Phone number must be between 7 and 15 digits max.');
      return;
    }
    if (containsDangerousMarkup(cleanMessage) || containsDangerousMarkup(cleanNotes)) {
      setError('Message and notes cannot contain HTML tags or < > brackets.');
      return;
    }
    setError(null);
    await onSubmit({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      service: service.trim(),
      channel,
      status,
      message: cleanMessage,
      adminNotes: cleanNotes,
      sourcePage: 'Admin Dashboard',
    });
  };

  const trackOptions = Array.from(
    new Set([
      ...courseSuggestions,
      'Corporate / Institutional Training',
      'Free Career Consultation',
    ])
  ).filter(Boolean);

  return (
    <MobileModalShell
      open={open}
      title="Log Offline / Phone Enquiry"
      subtitle="Save a direct phone call, WhatsApp lead, or walk-in enquiry to MySQL"
      titleId="enquiry-manual-modal-title"
      onClose={onClose}
      footer={
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="manual-enquiry-form"
            disabled={submitting}
            className="h-[42px] rounded-xl bg-[#145BFF] px-5 text-sm font-semibold text-white shadow-xs hover:bg-[#0F4AD6] disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save Lead'}
          </button>
        </div>
      }
    >
      <form
        id="manual-enquiry-form"
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="manual-lead-name"
              className="block text-xs font-semibold text-[#0B1736]"
            >
              Student / Client Name *
            </label>
            <input
              id="manual-lead-name"
              type="text"
              maxLength={PUBLIC_INPUT_LIMITS.nameMax}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter student or client full name"
              className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="manual-lead-email"
              className="block text-xs font-semibold text-[#0B1736]"
            >
              Email Address *
            </label>
            <input
              id="manual-lead-email"
              type="email"
              maxLength={PUBLIC_INPUT_LIMITS.emailMax}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="manual-lead-phone"
              className="block text-xs font-semibold text-[#0B1736]"
            >
              Phone / WhatsApp <span className="font-normal text-[#64748B]">(Max 15 digits)</span>
            </label>
            <input
              id="manual-lead-phone"
              type="tel"
              inputMode="tel"
              maxLength={PUBLIC_INPUT_LIMITS.phoneMaxChars}
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              placeholder="Enter phone number"
              className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="manual-lead-service"
              className="block text-xs font-semibold text-[#0B1736]"
            >
              Course / Track Interest
            </label>
            <select
              id="manual-lead-service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
            >
              {trackOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="manual-lead-channel"
              className="block text-xs font-semibold text-[#0B1736]"
            >
              Channel
            </label>
            <select
              id="manual-lead-channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
            >
              {CHANNEL_OPTIONS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="manual-lead-status"
              className="block text-xs font-semibold text-[#0B1736]"
            >
              Initial Status
            </label>
            <select
              id="manual-lead-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as EnquiryStatus)}
              className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
            >
              <option value="New">New</option>
              <option value="Read">Read</option>
              <option value="Replied">Replied</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="manual-lead-message"
            className="block text-xs font-semibold text-[#0B1736]"
          >
            Requirement Summary
          </label>
          <textarea
            id="manual-lead-message"
            rows={3}
            maxLength={PUBLIC_INPUT_LIMITS.messageMax}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Preferred batch dates, certification target, or background…"
            className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="manual-lead-notes"
            className="block text-xs font-semibold text-[#0B1736]"
          >
            Admin Follow-Up Notes
          </label>
          <textarea
            id="manual-lead-notes"
            rows={2}
            maxLength={PUBLIC_INPUT_LIMITS.messageMax}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Optional callback reminder or brochure sent…"
            className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
          />
        </div>

        {error && (
          <p role="alert" className="text-xs font-semibold text-[#DC2626]">
            {error}
          </p>
        )}
      </form>
    </MobileModalShell>
  );
}
