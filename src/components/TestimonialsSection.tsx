import { useState } from 'react';
import { motion } from 'motion/react';
import { Building2 } from 'lucide-react';
import {
  CORPORATE_PARTNERS,
  WHY_LEARN_ITEMS,
} from '../data/portfolioData';
import { usePublicTestimonials } from '../hooks/usePublicTestimonials';
import type { StudentTestimonial } from '../services/testimonialsService';
import { CountUpNumber } from './CountUpNumber';
import { useResponsiveReveal } from '../hooks/useResponsiveReveal';
import { OutlineButton } from './OutlineButton';
import {
  TestimonialCard,
  TestimonialDetailModal,
} from './TestimonialCardAndModal';

interface TestimonialsSectionProps {
  onNavigate?: (path: string) => void;
  showTestimonialsLink?: boolean;
  showStudentCards?: boolean;
}

export function TestimonialsSection({
  onNavigate,
  showTestimonialsLink = true,
  showStudentCards = true,
}: TestimonialsSectionProps) {
  const headerReveal = useResponsiveReveal(0.25, 0.6);
  const cardReveal = useResponsiveReveal(0.15, 0.55);
  const { pageData, loading } = usePublicTestimonials({
    featuredOnly: true,
    size: 3,
    enabled: showTestimonialsLink && showStudentCards,
  });
  const featuredStories = pageData.items;
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<StudentTestimonial | null>(null);

  return (
    <section
      aria-label="Corporate and Institutional Training"
      className="relative z-10 w-full px-5 sm:px-8 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-[1120px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={headerReveal.viewport}
          transition={{ duration: headerReveal.duration, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[680px]"
        >
          <h2 className="font-display text-[44px] sm:text-[56px] lg:text-[60px] font-bold leading-[1.12] uppercase text-[#303030] dark:text-white">
            CORPORATE &amp; INSTITUTIONAL TRAINING
          </h2>
          <p className="mt-4 text-[16px] sm:text-[18px] font-light leading-[1.55] text-[#303030] dark:text-white/80">
            Specialised training programmes delivered for leading organisations, government bodies
            and educational institutions.
          </p>
        </motion.div>

        {/* Portavia Editorial Bento Grid: Verified Institutions + Key Verified Facts */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CORPORATE_PARTNERS.slice(0, 2).map((partner, idx) => (
            <motion.article
              key={partner.organization}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={cardReveal.viewport}
              transition={{
                duration: cardReveal.duration,
                delay: cardReveal.isCompactViewport ? 0 : idx * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col justify-between rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-7 sm:p-8 min-h-[220px] transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E1F] text-[#5E67E6] dark:text-[#D0FF71] flex items-center justify-center">
                <Building2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="mt-6">
                <h3 className="font-display text-[26px] font-bold uppercase leading-[1.18] text-[#303030] dark:text-white">
                  {partner.organization}
                </h3>
                <p className="mt-2 text-[15px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
                  {partner.program}
                </p>
              </div>
            </motion.article>
          ))}

          {/* Verified Fact Card 1: 15+ Years Industry Experience */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={cardReveal.viewport}
            transition={{
              duration: cardReveal.duration,
              delay: cardReveal.isCompactViewport ? 0 : 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-col justify-between rounded-[22px] bg-[#2B2B2C] dark:bg-white text-white dark:text-[#303030] p-7 sm:p-8 min-h-[220px] transition-colors duration-300"
          >
            <p className="text-[16px] font-light leading-[1.55] opacity-90">
              Real production servers, enterprise networks &amp; hands-on mentoring
            </p>
            <div className="mt-8">
              <div className="font-display text-[64px] sm:text-[72px] font-bold leading-none">
                <CountUpNumber target={15} suffix="+" />
              </div>
              <p className="mt-2 text-[15px] font-light opacity-85">Years of Industry Experience</p>
            </div>
          </motion.div>

          {/* Verified Fact Card 2: 10 Core Domains */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={cardReveal.viewport}
            transition={{
              duration: cardReveal.duration,
              delay: cardReveal.isCompactViewport ? 0 : 0.14,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-col justify-between rounded-[22px] bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#303030] p-7 sm:p-8 min-h-[220px] transition-colors duration-300"
          >
            <p className="text-[16px] font-light leading-[1.55] opacity-95">
              Red Hat, CCNA, Cloud (AWS, GCP, Azure), DevOps, VMware &amp; Security under one roof
            </p>
            <div className="mt-8">
              <div className="font-display text-[64px] sm:text-[72px] font-bold leading-none">
                <CountUpNumber target={10} suffix="" />
              </div>
              <p className="mt-2 text-[15px] font-light opacity-90">Core Training Domains</p>
            </div>
          </motion.div>

          {/* Remaining 6 Verified Institutions */}
          {CORPORATE_PARTNERS.slice(2).map((partner, idx) => (
            <motion.article
              key={partner.organization}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={cardReveal.viewport}
              transition={{
                duration: cardReveal.duration,
                delay: cardReveal.isCompactViewport ? 0 : 0.05 * idx,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col justify-between rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-7 sm:p-8 min-h-[200px] transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E1F] text-[#5E67E6] dark:text-[#D0FF71] flex items-center justify-center">
                <Building2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="mt-5">
                <h3 className="font-display text-[24px] font-bold uppercase leading-[1.18] text-[#303030] dark:text-white">
                  {partner.organization}
                </h3>
                <p className="mt-2 text-[15px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
                  {partner.program}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Why Learn From Me Highlights */}
        <div className="mt-16 pt-14 border-t border-[#E5E5E5] dark:border-[#333335]">
          <div className="max-w-[640px]">
            <h3 className="font-display text-[36px] sm:text-[46px] font-bold uppercase leading-[1.12] text-[#303030] dark:text-white">
              WHY LEARN FROM ME?
            </h3>
            <p className="mt-3 text-[16px] sm:text-[18px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
              Training shaped by the industry, delivered by a practitioner.
            </p>
          </div>

          <div className="mt-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_LEARN_ITEMS.map((item) => (
              <div
                key={item.number}
                className="rounded-[20px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-6"
              >
                <span className="font-display text-[28px] font-bold text-[#5E67E6] dark:text-[#D0FF71]">
                  {item.number}.
                </span>
                <h4 className="mt-2 text-[17px] font-semibold text-[#303030] dark:text-white">
                  {item.title}
                </h4>
                <p className="mt-2 text-[14px] sm:text-[15px] font-light leading-[1.6] text-[#5C5C5C] dark:text-white/75">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {showTestimonialsLink && showStudentCards && onNavigate && (
            <div className="mt-16 pt-14 border-t border-[#E5E5E5] dark:border-[#333335]">
              <div className="max-w-[640px]">
                <h3 className="font-display text-[36px] sm:text-[46px] font-bold uppercase leading-[1.12] text-[#303030] dark:text-white">
                  STUDENT TESTIMONIALS
                </h3>
                <p className="mt-3 text-[16px] sm:text-[18px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
                  Placed learners sharing their hands-on lab training experience.
                </p>
              </div>

              {loading && featuredStories.length === 0 ? (
                <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className="animate-pulse rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-6 sm:p-7 space-y-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-full bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-28 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                          <div className="h-3 w-36 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                        </div>
                      </div>
                      <div className="h-3 w-full rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                      <div className="h-3 w-5/6 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                    </div>
                  ))}
                </div>
              ) : featuredStories.length === 0 ? (
                <div className="mt-9 rounded-[22px] border border-dashed border-[#D4D4D8] dark:border-[#3A3A3D] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-8 text-center">
                  <p className="text-[15px] font-light text-[#5C5C5C] dark:text-white/75">
                    Featured student testimonials will appear here once published from the Admin Dashboard.
                  </p>
                </div>
              ) : (
                <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredStories.slice(0, 3).map((student) => (
                    <TestimonialCard
                      key={student.id}
                      testimonial={student}
                      onOpenModal={setSelectedTestimonial}
                      avatarSizeClass="w-14 h-14"
                    />
                  ))}
                </div>
              )}

              <TestimonialDetailModal
                testimonial={selectedTestimonial}
                onClose={() => setSelectedTestimonial(null)}
              />

              <div className="mt-10 flex justify-center">
                <OutlineButton onClick={() => onNavigate('/testimonials')}>
                  ALL STUDENT TESTIMONIALS
                </OutlineButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
