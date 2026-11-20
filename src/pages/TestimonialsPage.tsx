import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ImagePlus, MessageSquareQuote, Plus, Trash2 } from 'lucide-react';
import {
  INITIAL_STUDENT_TESTIMONIALS,
  type StudentTestimonialItem,
} from '../data/portfolioData';
import { ContactSection } from '../components/ContactSection';
import { OutlineButton } from '../components/OutlineButton';
import { SafeImage } from '../components/SafeImage';
import { TestimonialsSection } from '../components/TestimonialsSection';

const STORAGE_KEY = 'arvind_thevar_student_testimonials_v2';

interface TestimonialsPageProps {
  onNavigate: (path: string) => void;
}

export function TestimonialsPage({ onNavigate }: TestimonialsPageProps) {
  const [testimonials, setTestimonials] = useState<StudentTestimonialItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_STUDENT_TESTIMONIALS;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StudentTestimonialItem[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to verified placed students
    }
    return INITIAL_STUDENT_TESTIMONIALS;
  });

  const [showForm, setShowForm] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [courseName, setCourseName] = useState('Red Hat Linux (RHEL)');
  const [quote, setQuote] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
    } catch {
      // Ignore quota errors
    }
  }, [testimonials]);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTestimonial = (e: FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !quote.trim()) {
      setFormError('Please enter the student name and written testimonial.');
      return;
    }

    const entry: StudentTestimonialItem = {
      id: `st-${Date.now()}`,
      name: studentName.trim(),
      course: courseName.trim(),
      quote: quote.trim(),
      photo: photoDataUrl,
      isCustom: true,
    };

    setTestimonials((prev) => [entry, ...prev]);
    setStudentName('');
    setQuote('');
    setPhotoDataUrl('');
    setFormError(null);
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    setTestimonials((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className="relative z-10">
      <section className="px-5 sm:px-8 pt-32 sm:pt-40 pb-12">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[740px]"
            >
              <h1 className="font-display text-[56px] sm:text-[84px] lg:text-[104px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white">
                STUDENT TESTIMONIALS
              </h1>
              <p className="mt-5 text-[16px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[580px]">
                Real student photos and written testimonials from learners trained across Linux,
                Cisco networking, Windows Server, virtualization and cloud batches.
              </p>
            </motion.div>

            <button
              type="button"
              onClick={() => setShowForm((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] px-5 py-3 text-[14px] font-medium hover:opacity-90 transition-opacity cursor-pointer min-h-[44px] shrink-0 self-start lg:self-end"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{showForm ? 'Close Form' : 'Add Student Testimonial'}</span>
            </button>
          </div>

          {/* Add Student Photo + Written Testimonial Form */}
          <AnimatePresence initial={false}>
            {showForm && (
              <motion.form
                onSubmit={handleAddTestimonial}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-8 rounded-[24px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-6 sm:p-8 border border-[#5E67E6]/25 dark:border-[#D0FF71]/25">
                  <h2 className="font-display text-[28px] font-bold uppercase text-[#303030] dark:text-white">
                    ADD STUDENT PHOTO &amp; TESTIMONIAL
                  </h2>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="st-name"
                        className="block text-[13px] font-medium text-[#5E67E6] dark:text-[#D0FF71] mb-1.5"
                      >
                        Student Name
                      </label>
                      <input
                        id="st-name"
                        type="text"
                        placeholder="Full name"
                        value={studentName}
                        onChange={(e) => {
                          setStudentName(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        className="w-full rounded-full bg-white dark:bg-[#1E1E1F] px-4 py-3 text-[14px] text-[#303030] dark:text-white placeholder:text-[#9A9A9A] focus:outline-none focus:ring-2 focus:ring-[#5E67E6] dark:focus:ring-[#D0FF71]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="st-course"
                        className="block text-[13px] font-medium text-[#5E67E6] dark:text-[#D0FF71] mb-1.5"
                      >
                        Training Track
                      </label>
                      <select
                        id="st-course"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        className="w-full rounded-full bg-white dark:bg-[#1E1E1F] px-4 py-3 text-[14px] text-[#303030] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5E67E6] dark:focus:ring-[#D0FF71]"
                      >
                        <option value="Red Hat Linux (RHEL)">Red Hat Linux (RHEL)</option>
                        <option value="Cisco CCNA">Cisco CCNA</option>
                        <option value="Cisco CCNP">Cisco CCNP</option>
                        <option value="AWS Solutions Architect Associate">
                          AWS Solutions Architect Associate
                        </option>
                        <option value="Windows Server & Virtualization">
                          Windows Server &amp; Virtualization
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="st-photo"
                        className="block text-[13px] font-medium text-[#5E67E6] dark:text-[#D0FF71] mb-1.5"
                      >
                        Student Photo (Optional)
                      </label>
                      <label
                        htmlFor="st-photo"
                        className="flex items-center gap-2 w-full rounded-full bg-white dark:bg-[#1E1E1F] px-4 py-3 text-[14px] text-[#5C5C5C] dark:text-white/75 cursor-pointer hover:ring-2 hover:ring-[#5E67E6] dark:hover:ring-[#D0FF71]"
                      >
                        <ImagePlus className="w-4 h-4 text-[#5E67E6] dark:text-[#D0FF71] shrink-0" />
                        <span className="truncate">
                          {photoDataUrl ? 'Photo selected' : 'Upload student photo'}
                        </span>
                      </label>
                      <input
                        id="st-photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="sr-only"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="st-quote"
                      className="block text-[13px] font-medium text-[#5E67E6] dark:text-[#D0FF71] mb-1.5"
                    >
                      Written Testimonial
                    </label>
                    <textarea
                      id="st-quote"
                      rows={3}
                      placeholder="Write the student's genuine feedback about the live labs, troubleshooting practice, and career guidance..."
                      value={quote}
                      onChange={(e) => {
                        setQuote(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      className="w-full rounded-[18px] bg-white dark:bg-[#1E1E1F] px-4 py-3 text-[14px] text-[#303030] dark:text-white placeholder:text-[#9A9A9A] focus:outline-none focus:ring-2 focus:ring-[#5E67E6] dark:focus:ring-[#D0FF71]"
                    />
                  </div>

                  {formError && (
                    <p className="mt-3 text-[13px] text-[#E53935] dark:text-[#FF7B7B]">
                      {formError}
                    </p>
                  )}

                  <div className="mt-5">
                    <OutlineButton type="submit">SAVE TESTIMONIAL</OutlineButton>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Student Testimonials Grid or Verified Empty State */}
          <div className="mt-10">
            {testimonials.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#D6D6DA] dark:border-[#3A3A3D] bg-[#F8F8FA] dark:bg-[#232325] p-8 sm:p-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#5E67E6]/10 dark:bg-[#D0FF71]/15 text-[#5E67E6] dark:text-[#D0FF71] flex items-center justify-center">
                  <MessageSquareQuote className="w-6 h-6" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-[30px] font-bold uppercase text-[#303030] dark:text-white">
                  VERIFIED STUDENT TESTIMONIALS
                </h2>
                <p className="mt-2 mx-auto max-w-[520px] text-[15px] sm:text-[16px] font-light leading-[1.6] text-[#5C5C5C] dark:text-white/75">
                  Student photos and written testimonials will appear here as they are added. Click
                  &ldquo;Add Student Testimonial&rdquo; above to publish a student’s photo and
                  written review.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <OutlineButton onClick={() => setShowForm(true)}>
                    ADD FIRST TESTIMONIAL
                  </OutlineButton>
                  <OutlineButton onClick={() => onNavigate('/upcoming-training')}>
                    EXPLORE TRAINING
                  </OutlineButton>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-7 border border-black/[0.04] dark:border-white/[0.06]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3.5">
                          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-[#5E67E6]/25 dark:ring-[#D0FF71]/35 bg-[#5E67E6]/15 dark:bg-[#D0FF71]/15 flex items-center justify-center text-[#5E67E6] dark:text-[#D0FF71] font-display text-[22px] font-bold">
                            {item.photo ? (
                              <SafeImage
                                src={item.photo}
                                alt={item.name}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              item.name.slice(0, 1).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h2 className="text-[17px] font-semibold text-[#303030] dark:text-white leading-snug">
                              {item.name}
                            </h2>
                            {item.role && (
                              <p className="mt-0.5 text-[13px] font-medium text-[#5E67E6] dark:text-[#D0FF71] leading-snug">
                                {item.role}
                              </p>
                            )}
                          </div>
                        </div>

                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            aria-label={`Remove testimonial from ${item.name}`}
                            className="text-[#5C5C5C] dark:text-white/55 hover:text-[#E53935] cursor-pointer p-1 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <p className="mt-5 text-[15px] font-light leading-[1.65] text-[#303030] dark:text-white/90">
                        “{item.quote}”
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E2E2E4] dark:border-[#3A3A3D] flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-white dark:bg-[#1E1E1F] px-3 py-1 text-[12px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                        {item.course}
                      </span>
                      <MessageSquareQuote
                        className="w-4 h-4 text-[#5E67E6]/70 dark:text-[#D0FF71]/70 shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <TestimonialsSection showTestimonialsLink={false} />
      <ContactSection />
    </main>
  );
}
