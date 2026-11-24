import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, ChevronDown, Clock, Plus, Trash2, Users } from 'lucide-react';
import { ASSETS, INITIAL_UPCOMING_BATCHES, type TrainingBatch } from '../data/portfolioData';
import { ContactSection } from '../components/ContactSection';
import { OutlineButton } from '../components/OutlineButton';
import { SafeImage } from '../components/SafeImage';

const TRAINING_CATEGORIES = ['All', 'Linux', 'Networking', 'Cloud'] as const;
const STORAGE_KEY = 'arvind_thevar_upcoming_batches_v1';

const COVER_BY_CATEGORY: Record<'Linux' | 'Networking' | 'Cloud', string> = {
  Linux: ASSETS.courseLinux,
  Networking: ASSETS.courseCisco,
  Cloud: ASSETS.courseAws,
};

interface UpcomingTrainingPageProps {
  onContactClick: () => void;
}

export function UpcomingTrainingPage({ onContactClick }: UpcomingTrainingPageProps) {
  const [batches, setBatches] = useState<TrainingBatch[]>(() => {
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
  const [showAddForm, setShowAddForm] = useState(false);

  const [courseTitle, setCourseTitle] = useState('Red Hat Linux (RHEL)');
  const [courseCategory, setCourseCategory] = useState<'Linux' | 'Networking' | 'Cloud'>('Linux');
  const [batchDate, setBatchDate] = useState('');
  const [batchTime, setBatchTime] = useState('');
  const [batchMode, setBatchMode] = useState('Live Online + Lab Sessions');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch {
      // Ignore storage quota errors
    }
  }, [batches]);

  const filtered =
    activeCategory === 'All'
      ? batches
      : batches.filter((item) => item.category === activeCategory);

  const handleAddBatch = (e: FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !batchDate.trim() || !batchTime.trim()) {
      setFormError('Please provide the course name, start date, and batch timing.');
      return;
    }

    const newBatch: TrainingBatch = {
      id: `custom-${Date.now()}`,
      title: courseTitle.trim(),
      category: courseCategory,
      batchDate: batchDate.trim(),
      batchTime: batchTime.trim(),
      mode: batchMode.trim() || 'Live Lab-Driven Training',
      summary:
        'Hands-on, lab-driven batch focused on real enterprise configurations, live troubleshooting and certification readiness.',
      modules: [
        'Plain-language core concepts & architecture',
        'Step-by-step live lab implementation',
        'Real-world troubleshooting & practical assignments',
        'Certification preparation & interview guidance',
      ],
      coverImage: COVER_BY_CATEGORY[courseCategory],
      isCustom: true,
    };

    setBatches((prev) => [newBatch, ...prev]);
    setExpandedId(newBatch.id);
    setBatchDate('');
    setBatchTime('');
    setFormError(null);
    setShowAddForm(false);
  };

  const handleRemoveCustomBatch = (id: string) => {
    setBatches((prev) => prev.filter((item) => item.id !== id));
  };

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
                UPCOMING TRAINING
              </h1>
              <p className="mt-5 text-[16px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[580px]">
                Explore upcoming hands-on batches in Red Hat Linux, Cisco Certified Network
                Associate (CCNA), and Amazon Web Services Solutions Architect Associate (AWS).
              </p>
            </motion.div>

            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] px-5 py-3 text-[14px] font-medium hover:opacity-90 transition-opacity cursor-pointer min-h-[44px] shrink-0 self-start lg:self-end"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{showAddForm ? 'Close Batch Form' : 'Add Batch Date & Time'}</span>
            </button>
          </div>

          {/* Trainer Batch Schedule Publisher Form */}
          <AnimatePresence initial={false}>
            {showAddForm && (
              <motion.form
                onSubmit={handleAddBatch}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-8 rounded-[24px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-6 sm:p-8 border border-[#5E67E6]/25 dark:border-[#D0FF71]/25">
                  <h2 className="font-display text-[28px] font-bold uppercase text-[#303030] dark:text-white">
                    UPLOAD UPCOMING BATCH DETAILS
                  </h2>
                  <p className="mt-1 text-[14px] font-light text-[#5C5C5C] dark:text-white/70">
                    Add a scheduled Red Hat Linux, Cisco CCNA or AWS batch with exact date and time.
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label
                        htmlFor="batch-course"
                        className="block text-[13px] font-medium text-[#5E67E6] dark:text-[#D0FF71] mb-1.5"
                      >
                        Training Course
                      </label>
                      <select
                        id="batch-course"
                        value={courseTitle}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCourseTitle(val);
                          if (val.includes('Linux')) setCourseCategory('Linux');
                          else if (val.includes('CCNA')) setCourseCategory('Networking');
                          else setCourseCategory('Cloud');
                        }}
                        className="w-full rounded-full bg-white dark:bg-[#1E1E1F] px-4 py-3 text-[14px] text-[#303030] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5E67E6] dark:focus:ring-[#D0FF71]"
                      >
                        <option value="Red Hat Linux (RHEL)">Red Hat Linux (RHEL)</option>
                        <option value="Cisco Certified Network Associate (CCNA)">
                          Cisco Certified Network Associate (CCNA)
                        </option>
                        <option value="Amazon Web Services Solutions Architect Associate (AWS)">
                          AWS Solutions Architect Associate (AWS)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="batch-date"
                        className="block text-[13px] font-medium text-[#5E67E6] dark:text-[#D0FF71] mb-1.5"
                      >
                        Start Date
                      </label>
                      <input
                        id="batch-date"
                        type="date"
                        value={batchDate}
                        onChange={(e) => {
                          setBatchDate(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        className="w-full rounded-full bg-white dark:bg-[#1E1E1F] px-4 py-3 text-[14px] text-[#303030] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5E67E6] dark:focus:ring-[#D0FF71]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="batch-time"
                        className="block text-[13px] font-medium text-[#5E67E6] dark:text-[#D0FF71] mb-1.5"
                      >
                        Batch Time
                      </label>
                      <input
                        id="batch-time"
                        type="text"
                        placeholder="e.g., 7:00 PM – 9:00 PM IST"
                        value={batchTime}
                        onChange={(e) => {
                          setBatchTime(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        className="w-full rounded-full bg-white dark:bg-[#1E1E1F] px-4 py-3 text-[14px] text-[#303030] dark:text-white placeholder:text-[#9A9A9A] focus:outline-none focus:ring-2 focus:ring-[#5E67E6] dark:focus:ring-[#D0FF71]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="batch-mode"
                        className="block text-[13px] font-medium text-[#5E67E6] dark:text-[#D0FF71] mb-1.5"
                      >
                        Format / Mode
                      </label>
                      <input
                        id="batch-mode"
                        type="text"
                        value={batchMode}
                        onChange={(e) => setBatchMode(e.target.value)}
                        className="w-full rounded-full bg-white dark:bg-[#1E1E1F] px-4 py-3 text-[14px] text-[#303030] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5E67E6] dark:focus:ring-[#D0FF71]"
                      />
                    </div>
                  </div>

                  {formError && (
                    <p className="mt-3 text-[13px] text-[#E53935] dark:text-[#FF7B7B]">
                      {formError}
                    </p>
                  )}

                  <div className="mt-5">
                    <OutlineButton type="submit">PUBLISH BATCH</OutlineButton>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

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
                        {program.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomBatch(program.id)}
                            aria-label={`Remove scheduled batch ${program.title}`}
                            className="inline-flex items-center gap-1.5 text-[13px] text-[#5C5C5C] dark:text-white/65 hover:text-[#E53935] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        )}
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
