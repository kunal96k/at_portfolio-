import { motion } from 'motion/react';
import {
  ASSETS,
  CORPORATE_PARTNERS,
  PROFILE,
  TRAINING_PHILOSOPHY,
  WHY_LEARN_ITEMS,
} from '../data/portfolioData';
import { ContactSection } from '../components/ContactSection';
import { SafeImage } from '../components/SafeImage';
import { ServicesAccordion } from '../components/ServicesAccordion';
import { SocialIcon } from '../components/SocialIcons';
import { usePublicCourses } from '../hooks/usePublicCourses';

export function AboutPage() {
  const { courses } = usePublicCourses();
  const visibleDomains = [...courses].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <main className="relative z-10">
      {/* Section 1: About Me Hero */}
      <section className="px-5 sm:px-8 pt-32 sm:pt-40 pb-16 sm:pb-24">
        <div className="mx-auto max-w-[1120px] grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-display text-[64px] sm:text-[88px] lg:text-[108px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white">
              ABOUT ME
            </h1>
            <p className="mt-6 font-display text-[28px] sm:text-[32px] font-normal uppercase text-[#303030] dark:text-white">
              {PROFILE.name}
            </p>
            <p className="mt-1 text-[17px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
              {PROFILE.aboutTagline}
            </p>

            <div className="mt-5 space-y-4 text-[16px] sm:text-[17px] font-light leading-[1.65] text-[#303030] dark:text-white/80 max-w-[540px]">
              {PROFILE.aboutParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-5">
              {PROFILE.socials.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="text-[#303030] dark:text-white hover:text-[#5E67E6] dark:hover:text-[#D0FF71] hover:-translate-y-0.5 transition-all"
                >
                  <SocialIcon id={social.id} className="w-[22px] h-[22px]" />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center lg:justify-end lg:sticky lg:top-28"
          >
            <div className="w-full max-w-[380px] aspect-[340/476] rounded-[22px] overflow-hidden shadow-[0_22px_54px_rgba(0,0,0,0.08)] dark:shadow-[0_22px_54px_rgba(0,0,0,0.45)] bg-[#D9D9D7]">
              <SafeImage
                src={ASSETS.portraitFront}
                alt="Arvind Thevar portrait"
                loading="eager"
                className="w-full h-full object-cover object-[40%_18%] scale-[1.08]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Core Course / Domains */}
      <section className="px-5 sm:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-[1120px]">
          <div className="max-w-[600px]">
            <h2 className="font-display text-[44px] sm:text-[56px] lg:text-[60px] font-bold leading-[1.12] uppercase text-[#303030] dark:text-white">
              CORE COURSE DOMAINS
            </h2>
            <p className="mt-3 text-[18px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
              {visibleDomains.length} specialized enterprise tracks. One goal: job-ready skills.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleDomains.map((domain, index) => (
              <div
                key={domain.id}
                className="rounded-[20px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-6 flex items-start gap-4"
              >
                <span className="font-display text-[32px] font-bold leading-none text-[#5E67E6] dark:text-[#D0FF71] shrink-0 tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-[24px] font-bold uppercase leading-[1.2] text-[#303030] dark:text-white">
                    {domain.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] font-light leading-[1.6] text-[#5C5C5C] dark:text-white/75">
                    {domain.shortDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Corporate & Institutional Training */}
      <section className="px-5 sm:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-[1120px] grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="font-display text-[44px] sm:text-[56px] lg:text-[60px] font-bold leading-[1.12] uppercase text-[#303030] dark:text-white">
              CORPORATE &amp; INSTITUTIONAL TRAINING
            </h2>
            <p className="mt-4 mb-10 text-[16px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[540px]">
              I’ve delivered specialised training programmes for leading organisations, government
              bodies and educational institutions, including:
            </p>

            <div className="divide-y divide-[#E5E5E5] dark:divide-[#333335] border-b border-[#E5E5E5] dark:border-[#333335]">
              {CORPORATE_PARTNERS.map((item) => (
                <div
                  key={item.organization}
                  className="py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <h3 className="font-display text-[24px] sm:text-[28px] font-normal uppercase text-[#303030] dark:text-white">
                    {item.organization}
                  </h3>
                  <p className="text-[15px] font-medium text-[#5E67E6] dark:text-[#D0FF71] sm:text-right">
                    {item.program}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end lg:sticky lg:top-28">
            <div className="w-full max-w-[380px] aspect-[340/476] rounded-[22px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] bg-[#E5E5E7] dark:bg-[#2C2C2D]">
              <SafeImage
                src={ASSETS.aboutStudio2}
                alt="Corporate and institutional training session"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: My Training Philosophy */}
      <section className="px-5 sm:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-[1120px]">
          <div className="max-w-[680px]">
            <h2 className="font-display text-[44px] sm:text-[56px] lg:text-[60px] font-bold leading-[1.12] uppercase text-[#303030] dark:text-white">
              MY TRAINING PHILOSOPHY
            </h2>
            <p className="mt-3 text-[18px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
              {TRAINING_PHILOSOPHY.tagline}
            </p>
            <div className="mt-4 space-y-3 text-[16px] sm:text-[17px] font-light leading-[1.6] text-[#303030] dark:text-white/80">
              {TRAINING_PHILOSOPHY.intro.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRAINING_PHILOSOPHY.steps.map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
                className="rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-6"
              >
                <span className="font-display text-[32px] font-bold text-[#5E67E6] dark:text-[#D0FF71]">
                  {step.number}
                </span>
                <h3 className="mt-2 font-display text-[22px] font-bold uppercase text-[#303030] dark:text-white leading-[1.2]">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[14.5px] font-light leading-[1.6] text-[#303030] dark:text-white/80">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Why Learn From Me & Mission */}
      <section className="px-5 sm:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-[1120px] grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="font-display text-[44px] sm:text-[56px] lg:text-[60px] font-bold leading-[1.12] uppercase text-[#303030] dark:text-white">
              WHY LEARN FROM ME?
            </h2>
            <p className="mt-3 mb-8 text-[17px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
              Training shaped by the industry, delivered by a practitioner.
            </p>
            <div className="space-y-5">
              {WHY_LEARN_ITEMS.map((item) => (
                <div
                  key={item.number}
                  className="rounded-[18px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-5 flex items-start gap-4"
                >
                  <span className="font-display text-[26px] font-bold text-[#5E67E6] dark:text-[#D0FF71] shrink-0">
                    {item.number}.
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#303030] dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[15px] font-light leading-[1.55] text-[#5C5C5C] dark:text-white/75">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8 lg:sticky lg:top-28">
            <div className="rounded-[24px] bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] p-8 sm:p-10">
              <h2 className="font-display text-[40px] sm:text-[48px] font-bold uppercase leading-[1.1]">
                MY MISSION
              </h2>
              <p className="mt-3 text-[17px] font-medium opacity-95">{PROFILE.missionTagline}</p>
              <div className="mt-4 space-y-4 text-[15.5px] font-light leading-[1.65] opacity-95">
                {PROFILE.missionParagraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            <ServicesAccordion />
          </div>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
