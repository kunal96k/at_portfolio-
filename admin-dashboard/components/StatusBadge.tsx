import { CheckCircle2, Clock, Eye, FileText, Sparkles, Archive, Mail } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; border: string; icon: typeof CheckCircle2 }
> = {
  Published: {
    bg: 'bg-[#ECFDF3]',
    text: 'text-[#027A48]',
    border: 'border-[#ABEFC6]',
    icon: CheckCircle2,
  },
  Active: {
    bg: 'bg-[#ECFDF3]',
    text: 'text-[#027A48]',
    border: 'border-[#ABEFC6]',
    icon: CheckCircle2,
  },
  Replied: {
    bg: 'bg-[#ECFDF3]',
    text: 'text-[#027A48]',
    border: 'border-[#ABEFC6]',
    icon: CheckCircle2,
  },
  Draft: {
    bg: 'bg-[#F8FAFC]',
    text: 'text-[#475569]',
    border: 'border-[#CBD5E1]',
    icon: FileText,
  },
  Scheduled: {
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#145BFF]',
    border: 'border-[#BFDBFE]',
    icon: Clock,
  },
  New: {
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#145BFF]',
    border: 'border-[#BFDBFE]',
    icon: Mail,
  },
  Read: {
    bg: 'bg-[#F8FAFC]',
    text: 'text-[#475569]',
    border: 'border-[#CBD5E1]',
    icon: Eye,
  },
  Featured: {
    bg: 'bg-[#FEFCE8]',
    text: 'text-[#A16207]',
    border: 'border-[#FDE68A]',
    icon: Sparkles,
  },
  Archived: {
    bg: 'bg-[#F8FAFC]',
    text: 'text-[#64748B]',
    border: 'border-[#E2E8F0]',
    icon: Archive,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? {
    bg: 'bg-[#F8FAFC]',
    text: 'text-[#475569]',
    border: 'border-[#CBD5E1]',
    icon: FileText,
  };
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${style.bg} ${style.text} ${style.border}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}
