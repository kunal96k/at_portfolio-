import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, ChevronDown, Clock, Users } from 'lucide-react';
import { ASSETS, INITIAL_UPCOMING_BATCHES, type TrainingBatch } from '../data/portfolioData';
import { ContactSection } from '../components/ContactSection';
import { OutlineButton } from '../components/OutlineButton';
import { SafeImage } from '../components/SafeImage';

const TRAINING_CATEGORIES = ['All', 'Linux', 'Networking', 'Cloud', 'DevOps'] as const;
const STORAGE_KEY = 'arvind_thevar_upcoming_batches_v1';

const COVER_BY_CATEGORY: Record<'Linux' | 'Networking' | 'Cloud' | 'DevOps', string> = {
  Linux: ASSETS.courseLinux,
  Networking: ASSETS.courseCisco,
  Cloud: ASSETS.courseAws,
  DevOps: ASSETS.courseCorporate,
};

interface UpcomingTrainingPageProps {
  onContactClick: () => void;
}

export function UpcomingTrainingPage({ onContactClick }: UpcomingTrainingPageProps) {
  const [batches] = useState<TrainingBatch[]>(() => {
    if (typeof window === 'undefined') return INITIAL_UPCOMING_BATCHES;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as TrainingBatch[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((batch) =>
            batch.coverImage?.includes('framerusercontent.com') ||
            batch.coverImage?.startsWith('/src/assets/images/')
              ? { ...batch, coverImage: COVER_BY_CATEGORY[batch.category] ?? ASSETS.courseLinux }
              : batch
          );
        }
      }
    } catch {
      // Fallback to default verified tracks
    }
    return INITIAL_UPCOMING_BATCHES;
  });

  const [activeCategory, setActiveCategory] = useState<(typeof TRAINING_CATEGORIES)[number]>('All');
  const [expandedId, setExpandedId] = useState<string | null>(
    INITIAL_UPCOMING_BATCHES[0]?.id ?? null
  );

  const filtered =
    activeCategory === 'All'
      ? batches
      : batches.filter((item) => item.category === activeCategory);

  return (
    <main className="relative z-10">
      <section className="px-5 sm:px-8 pt-32 sm:pt-40 pb-12 sm:pb-16">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[720px]"
            >
              <h1 className="font-display text-[56px] sm:text-[84px] lg:text-[104px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white">
                UPCOMING BATCHES
              </h1>
              <p className="mt-5 text-[16px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[580px]">
                Explore upcoming hands-on batches in Red Hat Linux (RHEL), Cisco CCNA, AWS Cloud Architecture, and DevOps &amp; Automation.
              </p>
            </motion.div>
          </div>

          {/* Category Filter */}
          <div
            role="tablist"
            aria-label="Filter training programs"
            className="mt-10 flex flex-wrap items-center gap-2.5"
          >
            {TRAINING_CATEGORIES.map((category) => {
              const selected = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-5 py-2.5 text-[14px] transition-colors cursor-pointer min-h-[44px] ${
                    selected
                      ? 'bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] font-medium'
                      : 'bg-[#F5F5F5] dark:bg-[#2C2C2D] text-[#303030] dark:text-white/85 font-light hover:bg-[#EAEAEA] dark:hover:bg-[#38383A]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Training Batch Cards */}
          <div className="mt-10 space-y-7">
            {filtered.map((program, idx) => {
              const isOpen = expandedId === program.id;
              return (
                <motion.article
                  key={program.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr] gap-6 sm:gap-8 rounded-[24px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-5 sm:p-7 overflow-hidden"
                >
                  <div className="rounded-[18px] overflow-hidden aspect-[16/10] lg:aspect-auto lg:h-full bg-[#E2E2E5] dark:bg-[#1F1F21]">
                    <SafeImage
                      src={program.coverImage}
                      alt={program.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-block rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] px-3.5 py-1 text-[12px] font-medium">
                          {program.category}
                        </span>
                      </div>

                      <h2 className="mt-4 font-display text-[32px] sm:text-[40px] font-bold leading-[1.1] uppercase text-[#303030] dark:text-white">
                        {program.title}
                      </h2>

                      <p className="mt-3 text-[15px] sm:text-[16px] font-light leading-[1.6] text-[#303030] dark:text-white/80">
                        {program.summary}
                      </p>

                      {/* Schedule Metadata */}
                      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[14px] font-light text-[#5C5C5C] dark:text-white/70">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#5E67E6] dark:text-[#D0FF71]" />
                          {program.batchDate}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#5E67E6] dark:text-[#D0FF71]" />
                          {program.batchTime}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#5E67E6] dark:text-[#D0FF71]" />
                          {program.mode}
                        </span>
                      </div>

                      {/* Expandable Syllabus */}
                      <div className="mt-6 border-t border-[#E2E2E4] dark:border-[#3A3A3D] pt-4">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setExpandedId(isOpen ? null : program.id)}
                          className="w-full flex items-center justify-between text-left py-1 text-[15px] font-medium text-[#303030] dark:text-white cursor-pointer"
                        >
                          <span>Key Lab Modules ({program.modules.length})</span>
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
                              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden mt-3 space-y-2"
                            >
                              {program.modules.map((mod, mIdx) => (
                                <li
                                   key={mod}
                                  className="flex items-start gap-2.5 text-[14px] sm:text-[15px] font-light text-[#303030] dark:text-white/80"
                                >
                                  <span className="font-display text-[15px] font-bold text-[#5E67E6] dark:text-[#D0FF71] tabular-nums">
                                    0{mIdx + 1}.
                                  </span>
                                  <span>{mod}</span>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="mt-6 pt-2">
                      <OutlineButton onClick={onContactClick}>ENQUIRE FOR BATCH</OutlineButton>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
