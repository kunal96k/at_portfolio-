import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { STUDY_RESOURCES } from '../data/portfolioData';
import { ContactSection } from '../components/ContactSection';
import { OutlineButton } from '../components/OutlineButton';

const RESOURCE_FILTERS = ['All', 'Notes', 'Lab Sections'] as const;

interface ResourcesPageProps {
  onNavigate: (path: string) => void;
}

export function ResourcesPage({ onNavigate }: ResourcesPageProps) {
  const [activeFilter, setActiveFilter] = useState<(typeof RESOURCE_FILTERS)[number]>('All');
  const [expandedId, setExpandedId] = useState<string | null>(STUDY_RESOURCES[0]?.id ?? null);

  const visibleResources =
    activeFilter === 'All'
      ? STUDY_RESOURCES
      : STUDY_RESOURCES.filter((item) => item.sectionType === activeFilter);

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

          {/* 100% Free — No Hidden Charges SEO Highlight Banner */}
          <div className="mt-8 rounded-[22px] bg-[#5E67E6]/10 dark:bg-[#D0FF71]/12 border border-[#5E67E6]/25 dark:border-[#D0FF71]/30 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-[20px] sm:text-[22px] font-bold uppercase tracking-wide text-[#303030] dark:text-white">
                100% Free Study Notes &amp; Lab PDFs — No Hidden Charges
              </p>
              <p className="mt-1 text-[14px] sm:text-[15px] font-light leading-[1.6] text-[#303030]/85 dark:text-white/80">
                Download free Red Hat Linux (RHEL / RHCSA / RHCE), Cisco CCNA &amp; CCNP, Windows
                Server, Virtualization, and AWS Solutions Architect notes and lab workbooks directly
                below. Completely free educational resources with zero hidden charges, no
                subscriptions, and no login required.
              </p>
            </div>
          </div>

          {/* Filter Tabs: All / Notes / Lab Sections */}
          <div
            role="tablist"
            aria-label="Filter study materials"
            className="mt-9 flex flex-wrap items-center gap-2.5"
          >
            {RESOURCE_FILTERS.map((tab) => {
              const selected = activeFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveFilter(tab)}
                  className={`rounded-full px-5 py-2.5 text-[14px] transition-colors cursor-pointer min-h-[44px] ${
                    selected
                      ? 'bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] font-medium'
                      : 'bg-[#F5F5F5] dark:bg-[#2C2C2D] text-[#303030] dark:text-white/85 font-light hover:bg-[#EAEAEA] dark:hover:bg-[#38383A]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Resource Cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleResources.map((resource, idx) => {
              const isOpen = expandedId === resource.id;
              const isLab = resource.sectionType === 'Lab Sections';
              return (
                <motion.article
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: idx * 0.05 }}
                  className="flex flex-col justify-between rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-7"
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
                      <span className="text-[13px] font-light text-[#5C5C5C] dark:text-white/65">
                        {resource.domain}
                      </span>
                    </div>

                    <h2 className="mt-4 font-display text-[28px] sm:text-[32px] font-bold leading-[1.15] uppercase text-[#303030] dark:text-white">
                      {resource.title}
                    </h2>

                    <p className="mt-3 text-[15px] font-light leading-[1.6] text-[#303030] dark:text-white/80">
                      {resource.summary}
                    </p>

                    {/* Sample Downloadable PDF Resource Box */}
                    <div className="mt-5 rounded-[16px] bg-white dark:bg-[#1E1E1F] p-4 border border-black/[0.06] dark:border-white/[0.08]">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#5E67E6]/10 dark:bg-[#D0FF71]/15 text-[#5E67E6] dark:text-[#D0FF71] shrink-0">
                          <FileText className="w-5 h-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-semibold text-[#303030] dark:text-white truncate">
                            {resource.fileName}
                          </p>
                          <p className="text-[12px] font-light text-[#5C5C5C] dark:text-white/65">
                            {resource.fileType} · No Hidden Charges
                          </p>
                        </div>
                      </div>

                      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                        <a
                          href={resource.fileUrl}
                          download={resource.fileName}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] px-4 py-2 text-[13px] font-medium hover:opacity-90 transition-opacity min-h-[38px]"
                        >
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Download Free PDF</span>
                        </a>
                        <a
                          href={resource.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#303030]/20 dark:border-white/20 px-4 py-2 text-[13px] font-normal text-[#303030] dark:text-white hover:bg-[#303030] hover:text-white dark:hover:bg-white dark:hover:text-[#1A1A1B] transition-colors min-h-[38px]"
                        >
                          <span>Preview PDF</span>
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E2E2E4] dark:border-[#3A3A3D]">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setExpandedId(isOpen ? null : resource.id)}
                      className="w-full flex items-center justify-between text-left text-[14px] font-medium text-[#5E67E6] dark:text-[#D0FF71] cursor-pointer min-h-[36px]"
                    >
                      <span>{isOpen ? 'Hide topics & lab outline' : 'View topics & lab outline'}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
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
                </motion.article>
              );
            })}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <OutlineButton onClick={() => onNavigate('/blogs')}>READ BLOGS</OutlineButton>
            <OutlineButton onClick={() => onNavigate('/upcoming-training')}>
              EXPLORE UPCOMING BATCHES
            </OutlineButton>
          </div>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
