import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  Check,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Loader2,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react';
import {
  ContactSection,
  type ContactPrefillData,
} from '../components/ContactSection';
import { OutlineButton } from '../components/OutlineButton';
import { ProtectedResourcePreviewModal } from '../components/ProtectedResourcePreviewModal';
import { PublicPagination } from '../components/PublicPagination';
import { TruncatedTextWithMore } from '../components/TruncatedTextWithMore';
import { PROFILE } from '../data/portfolioData';
import { usePublicResources } from '../hooks/usePublicResources';
import {
  downloadResourceSafely,
  type StudyResourceNote,
} from '../services/resourcesService';

const RESOURCE_FILTERS = ['All', 'Notes', 'Lab Sections'] as const;

function resolveContactService(domain: string): string {
  const trimmed = domain.trim();
  if (trimmed.length >= 2) {
    return trimmed;
  }
  return 'Free Career Consultation';
}

interface ResourcesPageProps {
  onNavigate: (path: string) => void;
}

export function ResourcesPage({ onNavigate }: ResourcesPageProps) {
  const {
    query,
    pageData,
    loading,
    isDebouncing,
    setSearch,
    flushSearch,
    setSectionType,
    setDomain,
    setPage,
    resetFilters,
    trackDownload,
  } = usePublicResources();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewTarget, setPreviewTarget] =
    useState<StudyResourceNote | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [blockedNoteIds, setBlockedNoteIds] = useState<Record<string, boolean>>(
    {}
  );
  const [downloadNotice, setDownloadNotice] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [contactPrefill, setContactPrefill] =
    useState<ContactPrefillData | null>(null);

  const visibleResources = pageData.items;
  const effectiveExpandedId =
    expandedId !== null ? expandedId : visibleResources[0]?.id ?? null;

  const hasActiveFilter =
    query.search.trim() !== '' ||
    query.sectionType !== 'All' ||
    query.domain !== 'All';

  const startItem =
    pageData.totalItems === 0 ? 0 : pageData.page * pageData.size + 1;
  const endItem = Math.min(
    pageData.totalItems,
    pageData.page * pageData.size + visibleResources.length
  );

  const handleRequestDownload = (resource: StudyResourceNote) => {
    setContactPrefill({
      id: Date.now(),
      service: resolveContactService(resource.domain),
      message: `Hello Arvind Sir, I would like to request download access for the study material "${resource.title}".`,
    });
    if (typeof document !== 'undefined') {
      window.setTimeout(() => {
        document
          .getElementById('contact')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const handleDownload = async (resource: StudyResourceNote) => {
    if (downloadingId === resource.id) return;
    setDownloadingId(resource.id);
    setDownloadNotice(null);
    try {
      const result = await downloadResourceSafely(resource, { isAdmin: false });
      if (result.blocked) {
        setBlockedNoteIds((prev) => ({ ...prev, [resource.id]: true }));
        setDownloadNotice({
          id: resource.id,
          text:
            result.message ||
            'Online preview is open for this file. Please contact Arvind Thevar to request a downloadable copy.',
        });
      } else {
        trackDownload(resource.id, result.updatedDownloads);
        setPreviewTarget((prev) =>
          prev && prev.id === resource.id
            ? {
              ...prev,
              downloads:
                typeof result.updatedDownloads === 'number'
                  ? result.updatedDownloads
                  : prev.downloads + 1,
            }
            : prev
        );
      }
    } catch (err) {
      setDownloadNotice({
        id: resource.id,
        text:
          err instanceof Error
            ? err.message
            : 'Unable to download right now. Please contact Arvind Thevar.',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main className="relative z-10">
      <section className="px-5 sm:px-8 pt-32 sm:pt-40 pb-14 sm:pb-20">
        <div className="mx-auto max-w-[1120px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[780px]"
          >
            <h1 className="font-display text-[56px] sm:text-[84px] lg:text-[104px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white">
              STUDY MATERIALS
            </h1>
            <p className="mt-5 text-[16px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[640px]">
              Structured notes and practical lab sections covering Red Hat Enterprise Linux (RHEL),
              Cisco CCNA &amp; CCNP, Windows Server, Virtualization and AWS Cloud Computing.
            </p>
          </motion.div>

          {/* Protected Preview & Access Control Banner */}
          <div className="mt-8 rounded-[22px] bg-[#5E67E6]/10 dark:bg-[#D0FF71]/12 border border-[#5E67E6]/25 dark:border-[#D0FF71]/30 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-[20px] sm:text-[22px] font-bold uppercase tracking-wide text-[#303030] dark:text-white">
                Structured Study Notes &amp; Lab Workbooks
              </p>
              <p className="mt-1 text-[14px] sm:text-[15px] font-light leading-[1.6] text-[#303030]/85 dark:text-white/80">
                Browse Red Hat Linux (RHEL / RHCSA / RHCE), Cisco CCNA &amp; CCNP, Windows
                Server, Virtualization, and AWS Solutions Architect study materials online.
                Need a downloadable copy? Reach out to Arvind Thevar anytime.
              </p>
            </div>
          </div>

          {/* Search + Section Tabs + Domain Filter */}
          <div className="mt-9 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div
              role="tablist"
              aria-label="Filter study materials"
              className="flex flex-wrap items-center gap-2.5"
            >
              {RESOURCE_FILTERS.map((tab) => {
                const selected = query.sectionType === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setSectionType(tab)}
                    className={`rounded-full px-5 py-2.5 text-[14px] transition-colors cursor-pointer min-h-[44px] ${selected
                      ? 'bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] font-medium'
                      : 'bg-[#F5F5F5] dark:bg-[#2C2C2D] text-[#303030] dark:text-white/85 font-light hover:bg-[#EAEAEA] dark:hover:bg-[#38383A]'
                      }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="relative min-w-0 sm:w-[270px]">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#5C5C5C] dark:text-white/60"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  maxLength={120}
                  value={query.search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      flushSearch(query.search);
                    }
                  }}
                  placeholder="Search notes, topics, PDF..."
                  aria-label="Search study notes"
                  className="h-[44px] w-full rounded-full border border-[#303030]/15 dark:border-white/15 bg-[#F5F5F5] dark:bg-[#2C2C2D] py-2 pr-10 pl-10 text-[13.5px] text-[#303030] dark:text-white placeholder:text-[#64748B] focus:border-[#5E67E6] dark:focus:border-[#D0FF71] focus:outline-none"
                />
                <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1">
                  {(loading || isDebouncing) && (
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin text-[#5E67E6] dark:text-[#D0FF71]"
                      aria-hidden="true"
                    />
                  )}
                  {query.search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        flushSearch('');
                      }}
                      aria-label="Clear notes search"
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[#5C5C5C] hover:bg-black/5 dark:text-white/70"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {pageData.availableDomains.length > 0 && (
                <select
                  aria-label="Filter by subject domain"
                  value={query.domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="h-[44px] rounded-full border border-[#303030]/15 dark:border-white/15 bg-[#F5F5F5] dark:bg-[#2C2C2D] px-4 text-[13.5px] text-[#303030] dark:text-white focus:border-[#5E67E6] dark:focus:border-[#D0FF71] focus:outline-none"
                >
                  <option value="All">All Domains</option>
                  {pageData.availableDomains.map((dom) => (
                    <option key={dom} value={dom}>
                      {dom}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Loading Skeleton, Empty State, or Resource Cards */}
          {loading && visibleResources.length === 0 ? (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1, 2, 3].map((skeleton) => (
                <div
                  key={skeleton}
                  className="animate-pulse rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-7 space-y-4"
                >
                  <div className="h-5 w-28 rounded-full bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                  <div className="h-8 w-4/5 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                  <div className="h-16 w-full rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                  <div className="h-24 w-full rounded-[16px] bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                </div>
              ))}
            </div>
          ) : visibleResources.length === 0 ? (
            <div className="mt-12 rounded-[24px] border border-dashed border-[#D4D4D8] dark:border-[#3A3A3D] bg-[#F5F5F5] dark:bg-[#2C2C2D] px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-[#1E1E1F] text-[#5E67E6] dark:text-[#D0FF71] shadow-xs">
                <BookOpen className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-display text-[28px] sm:text-[34px] font-bold uppercase text-[#303030] dark:text-white">
                {hasActiveFilter
                  ? 'No Matching Study Notes Found'
                  : 'No Study Materials Available Right Now'}
              </h2>
              <p className="mx-auto mt-2.5 max-w-[540px] text-[15px] sm:text-[16px] font-light leading-[1.6] text-[#5C5C5C] dark:text-white/75">
                {hasActiveFilter
                  ? 'Try clearing your search or selecting All notes to browse all study materials.'
                  : 'Study notes and lab workbooks published from the Admin Dashboard will appear here automatically.'}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                {hasActiveFilter ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center justify-center rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-6 py-2.5 text-[14px] font-medium text-white dark:text-[#1A1A1B] cursor-pointer"
                  >
                    Reset Filters
                  </button>
                ) : (
                  <>
                    <OutlineButton onClick={() => onNavigate('/blogs')}>
                      READ BLOGS
                    </OutlineButton>
                    <OutlineButton
                      onClick={() => onNavigate('/upcoming-batches')}
                    >
                      UPCOMING BATCHES
                    </OutlineButton>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleResources.map((resource, idx) => {
                const isOpen = effectiveExpandedId === resource.id;
                const isLab = resource.sectionType === 'Lab Sections';
                const resourceHasFile = Boolean(
                  resource.hasFile ||
                  resource.hasUploadedFile ||
                  String(resource.fileUrl ?? '').trim() !== ''
                );
                const canDownload =
                  resourceHasFile &&
                  resource.downloadEnabled &&
                  !blockedNoteIds[resource.id];
                const whatsappHref = `https://wa.me/91${PROFILE.whatsappNumber}?text=${encodeURIComponent(
                  `Hello Arvind Sir, I would like to request download access for study note: ${resource.title}.`
                )}`;

                return (
                  <motion.article
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: idx * 0.05 }}
                    className="flex h-full flex-col justify-between rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-7"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#1E1E1F] px-3.5 py-1 text-[12px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                          {isLab ? (
                            <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          {resource.sectionType}
                        </span>
                        <span className="text-[13px] font-light text-[#5C5C5C] dark:text-white/65 line-clamp-1">
                          {resource.domain}
                        </span>
                      </div>

                      <h2 className="mt-4 font-display text-[28px] sm:text-[32px] font-bold leading-[1.15] uppercase text-[#303030] dark:text-white line-clamp-2">
                        {resource.title}
                      </h2>

                      {resource.summary.trim() && (
                        <div className="mt-3">
                          <TruncatedTextWithMore
                            lines={3}
                            text={resource.summary}
                            className="text-[15px] font-light leading-[1.6] text-[#303030] dark:text-white/80"
                            ariaLabel={`Read full overview for ${resource.title}`}
                            onMore={() => setPreviewTarget(resource)}
                          />
                        </div>
                      )}

                      {/* Study File Preview / Conditional Download Card */}
                      <div className="mt-5 rounded-[16px] bg-white dark:bg-[#1E1E1F] p-4 border border-black/[0.06] dark:border-white/[0.08]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#5E67E6]/10 dark:bg-[#D0FF71]/15 text-[#5E67E6] dark:text-[#D0FF71] shrink-0">
                              <FileText className="w-5 h-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[13.5px] font-semibold text-[#303030] dark:text-white truncate">
                                {resourceHasFile
                                  ? resource.fileName || `${resource.slug}.pdf`
                                  : 'Study Notes Outline'}
                              </p>
                              <p className="text-[12px] font-light text-[#5C5C5C] dark:text-white/65">
                                {resourceHasFile
                                  ? `${resource.fileType || 'PDF'} · ${resource.fileSizeLabel} · ${resource.downloads} ${resource.downloads === 1 ? 'download' : 'downloads'}`
                                  : 'Summary & syllabus overview'}
                              </p>
                            </div>
                          </div>

                          {canDownload && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                              <Check className="w-3 h-3" aria-hidden="true" />
                              <span>Download Open</span>
                            </span>
                          )}
                        </div>

                        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setPreviewTarget(resource)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] px-4 py-2 text-[13px] font-medium hover:opacity-90 transition-opacity min-h-[38px] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>
                              {resourceHasFile ? 'Preview File' : 'View Overview'}
                            </span>
                          </button>

                          {canDownload && (
                            <button
                              type="button"
                              disabled={downloadingId === resource.id}
                              onClick={() => void handleDownload(resource)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#303030]/20 dark:border-white/20 px-4 py-2 text-[13px] font-medium text-[#303030] dark:text-white hover:bg-[#303030] hover:text-white dark:hover:bg-white dark:hover:text-[#1A1A1B] transition-colors min-h-[38px] disabled:opacity-50 cursor-pointer"
                            >
                              {downloadingId === resource.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                              ) : (
                                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                              )}
                              <span>
                                Download Free {resource.fileType || 'PDF'}
                              </span>
                            </button>
                          )}
                        </div>

                        {downloadNotice?.id === resource.id && (
                          <p
                            role="status"
                            className="mt-2.5 text-[12px] font-medium text-amber-700 dark:text-amber-300"
                          >
                            {downloadNotice.text}
                          </p>
                        )}

                        {resourceHasFile && !canDownload && (
                          <div className="mt-3.5 rounded-[12px] border border-amber-500/25 bg-amber-500/[0.08] p-3">
                            <div className="flex items-start gap-2 text-[12.5px] text-[#303030] dark:text-white/85">
                              <Lock
                                className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400"
                                aria-hidden="true"
                              />
                              <div>
                                <p className="font-semibold">
                                  Need a Downloadable Copy?
                                </p>
                                <p className="mt-0.5 text-[12px] font-light text-[#5C5C5C] dark:text-white/75">
                                  You can read this file online. Contact Arvind Thevar anytime to request a copy.
                                </p>
                              </div>
                            </div>

                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRequestDownload(resource)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#303030] dark:bg-white text-white dark:text-[#1A1A1B] px-3.5 py-1.5 text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer"
                              >
                                <Mail className="w-3 h-3" aria-hidden="true" />
                                <span>Contact to Request Download</span>
                              </button>
                              <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-[12px] font-medium text-emerald-700 dark:text-emerald-300"
                              >
                                <MessageCircle className="w-3 h-3" aria-hidden="true" />
                                <span>WhatsApp</span>
                              </a>
                              <a
                                href={PROFILE.phoneHref}
                                className="inline-flex items-center gap-1 rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-[12px] font-medium text-[#303030] dark:text-white"
                              >
                                <Phone className="w-3 h-3" aria-hidden="true" />
                                <span>Call</span>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {resource.topics.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-[#E2E2E4] dark:border-[#3A3A3D]">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setExpandedId(isOpen ? '' : resource.id)}
                          className="w-full flex items-center justify-between text-left text-[14px] font-medium text-[#5E67E6] dark:text-[#D0FF71] cursor-pointer min-h-[36px]"
                        >
                          <span>
                            {isOpen
                              ? 'Hide topics & lab outline'
                              : 'View topics & lab outline'}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                              }`}
                            aria-hidden="true"
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.ul
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden mt-3 space-y-2"
                            >
                              {resource.topics.map((point) => (
                                <li
                                  key={point}
                                  className="flex items-start gap-2.5 text-[14px] font-light text-[#303030] dark:text-white/85"
                                >
                                  <Check
                                    className="w-4 h-4 shrink-0 mt-0.5 text-[#5E67E6] dark:text-[#D0FF71]"
                                    aria-hidden="true"
                                  />
                                  <span>{point}</span>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </div>
          )}

          {/* Server-Side Pagination UI (6 study notes per page, compact ellipsis when > 10 pages) */}
          <PublicPagination
            ariaLabel="Study materials pagination"
            itemLabel="study notes"
            page={pageData.page}
            totalPages={pageData.totalPages}
            totalItems={pageData.totalItems}
            startItem={startItem}
            endItem={endItem}
            hasPrevious={pageData.hasPrevious}
            hasNext={pageData.hasNext}
            onPageChange={setPage}
          />

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <OutlineButton onClick={() => onNavigate('/blogs')}>READ BLOGS</OutlineButton>
            <OutlineButton onClick={() => onNavigate('/upcoming-batches')}>
              EXPLORE UPCOMING BATCHES
            </OutlineButton>
          </div>
        </div>
      </section>

      <ContactSection prefillData={contactPrefill} />

      <ProtectedResourcePreviewModal
        resource={previewTarget}
        isPublic
        onClose={() => setPreviewTarget(null)}
        onDownload={(note) => void handleDownload(note)}
        onRequestDownload={handleRequestDownload}
      />
    </main>
  );
}
