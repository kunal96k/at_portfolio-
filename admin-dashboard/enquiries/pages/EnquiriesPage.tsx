import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Inbox,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { ToastItem } from '../../types/admin';
import { EnquiryDetailModal } from '../components/EnquiryDetailModal';
import { EnquiryFiltersBar } from '../components/EnquiryFiltersBar';
import { EnquiryTableAndCards } from '../components/EnquiryTableAndCards';
import { EnquiryManualFormModal } from '../forms/EnquiryManualFormModal';
import { useEnquiries } from '../hooks/useEnquiries';
import type {
  ContactEnquiryItem,
  EnquirySortField,
  EnquiryStatus,
  ManualEnquiryPayload,
} from '../types/enquiry';

interface EnquiriesPageProps {
  onToast: (toast: Omit<ToastItem, 'id'>) => void;
  domainSuggestions?: string[];
  onCountChange?: (totalCount: number, newCount: number) => void;
}

export function EnquiriesPage({
  onToast,
  domainSuggestions = [],
  onCountChange,
}: EnquiriesPageProps) {
  const {
    items,
    stats,
    availableChannels,
    availableServices,
    query,
    loading,
    searching,
    error,
    submitting,
    paginated,
    updateQuery,
    flushSearch,
    resetFilters,
    reload,
    createManual,
    updateEnquiry,
    updateStatus,
    deleteItem,
  } = useEnquiries(onCountChange);

  const [detailTarget, setDetailTarget] = useState<ContactEnquiryItem | null>(
    null
  );
  const [manualOpen, setManualOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactEnquiryItem | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const handleSort = (field: EnquirySortField) => {
    if (query.sortBy === field) {
      updateQuery({ sortDir: query.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      updateQuery({
        sortBy: field,
        sortDir: field === 'name' || field === 'status' ? 'asc' : 'desc',
      });
    }
  };

  const handleQuickStatus = async (
    item: ContactEnquiryItem,
    nextStatus: EnquiryStatus
  ) => {
    try {
      const updated = await updateStatus(item.id, nextStatus);
      onToast({
        tone: 'success',
        title: `Marked enquiry as ${updated.status}`,
        description: `${updated.name} (${updated.email})`,
      });
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Status update failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleSaveDetail = async (
    id: string,
    payload: { status: EnquiryStatus; adminNotes: string }
  ) => {
    try {
      const updated = await updateEnquiry(id, payload);
      setDetailTarget(updated);
      onToast({
        tone: 'success',
        title: 'Enquiry follow-up saved',
        description: `${updated.name} marked as ${updated.status}.`,
      });
      setDetailTarget(null);
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Unable to update enquiry',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleManualSubmit = async (payload: ManualEnquiryPayload) => {
    try {
      const created = await createManual(payload);
      onToast({
        tone: 'success',
        title: 'Offline enquiry logged',
        description: `${created.name} saved under ${created.channel}.`,
      });
      setManualOpen(false);
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Unable to log enquiry',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteItem(deleteTarget.id);
      onToast({
        tone: 'success',
        title: 'Enquiry permanently deleted',
        description: `Lead from ${deleteTarget.name} removed from database.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const kpiCards = [
    {
      label: 'Total Enquiries',
      value: stats.total,
      icon: Inbox,
      tone: 'text-[#145BFF] bg-[#EFF6FF]',
      filterStatus: 'All' as const,
    },
    {
      label: 'New Leads',
      value: stats.newCount,
      icon: Mail,
      tone: 'text-[#145BFF] bg-[#EFF6FF]',
      filterStatus: 'New' as const,
    },
    {
      label: 'Read / Reviewed',
      value: stats.readCount,
      icon: Eye,
      tone: 'text-[#475569] bg-[#F1F5F9]',
      filterStatus: 'Read' as const,
    },
    {
      label: 'Replied',
      value: stats.repliedCount,
      icon: CheckCircle2,
      tone: 'text-[#027A48] bg-[#ECFDF3]',
      filterStatus: 'Replied' as const,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0B1736] sm:text-2xl">
            Enquiries &amp; Training Leads
          </h1>
          <p className="mt-0.5 text-xs text-[#64748B] sm:text-sm">
            Review incoming website contact submissions, batch waitlist leads, and phone follow-ups.
          </p>
        </div>

        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="inline-flex h-[40px] items-center justify-center gap-1.5 self-start rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#0B1736] shadow-2xs transition-colors hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${searching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const active = query.status === kpi.filterStatus;
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={() => updateQuery({ status: kpi.filterStatus })}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left shadow-2xs transition-colors ${
                active
                  ? 'border-[#145BFF] bg-[#EFF6FF]/40'
                  : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
              }`}
            >
              <div>
                <p className="text-xs font-medium text-[#64748B]">{kpi.label}</p>
                <p className="mt-1 text-2xl font-bold text-[#0B1736] tabular-nums">
                  {kpi.value}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.tone}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Failed to load contact enquiries</p>
            <p className="mt-0.5 text-xs text-[#B91C1C]">{error}</p>
          </div>
          <button
            type="button"
            onClick={reload}
            className="shrink-0 rounded-lg border border-[#FCA5A5] bg-white px-3 py-1.5 text-xs font-semibold text-[#991B1B]"
          >
            Retry
          </button>
        </div>
      )}

      <EnquiryFiltersBar
        query={query}
        channels={availableChannels}
        services={availableServices}
        searching={searching}
        onUpdateQuery={updateQuery}
        onFlushSearch={flushSearch}
        onResetFilters={resetFilters}
        onCreateManual={() => setManualOpen(true)}
      />

      <EnquiryTableAndCards
        items={items}
        loading={loading}
        totalRecordsCount={stats.total}
        sortBy={query.sortBy}
        sortDir={query.sortDir}
        onSort={handleSort}
        currentPage={paginated.currentPage}
        totalPages={paginated.totalPages}
        totalItems={paginated.totalItems}
        startIndex={paginated.startIndex}
        endIndex={paginated.endIndex}
        onPageChange={(page) => updateQuery({ page })}
        onViewDetail={(item) => setDetailTarget(item)}
        onQuickStatus={(item, status) => void handleQuickStatus(item, status)}
        onDelete={(item) => setDeleteTarget(item)}
        onCreateManual={() => setManualOpen(true)}
      />

      <EnquiryDetailModal
        enquiry={detailTarget}
        submitting={submitting}
        onClose={() => setDetailTarget(null)}
        onSave={handleSaveDetail}
      />

      <EnquiryManualFormModal
        open={manualOpen}
        submitting={submitting}
        courseSuggestions={domainSuggestions}
        onClose={() => setManualOpen(false)}
        onSubmit={handleManualSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this enquiry?"
        description={
          deleteTarget
            ? `Permanently delete the enquiry from "${deleteTarget.name}" (${deleteTarget.email})? This cannot be undone.`
            : ''
        }
        confirmLabel={deleting ? 'Deleting…' : 'Delete Enquiry'}
        destructive
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
