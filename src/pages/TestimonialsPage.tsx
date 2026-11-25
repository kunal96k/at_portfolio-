import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquareQuote } from 'lucide-react';
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
  const [testimonials] = useState<StudentTestimonialItem[]>(() => {
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
          </div>

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
                  Verified student reviews and industry feedback from past batches.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
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
                      </div>

                      <p className="mt-4 text-[13px] font-medium uppercase tracking-wider text-[#5E67E6] dark:text-[#D0FF71]">
                        {item.course}
                      </p>

                      <blockquote className="mt-3 text-[15px] font-light leading-[1.65] text-[#303030] dark:text-white/80">
                        &ldquo;{item.quote}&rdquo;
                      </blockquote>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E5E5E5] dark:border-[#38383A] flex items-center justify-between text-[12.5px] font-light text-[#5C5C5C] dark:text-white/60">
                      <span>Verified Learner</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Testimonials Showcase Strip */}
      <TestimonialsSection onNavigate={onNavigate} />

      <ContactSection />
    </main>
  );
}
