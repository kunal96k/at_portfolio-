import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { ABOUT_STATS, ASSETS, PROFILE } from '../data/portfolioData';
import { computePortraitChoreography } from '../utils/scrollMath';
import { CountUpNumber } from './CountUpNumber';
import { HiBadge } from './HiBadge';
import { OutlineButton } from './OutlineButton';
import { SafeImage } from './SafeImage';
import { SocialIcon } from './SocialIcons';
import { ServicesAccordion } from './ServicesAccordion';

interface PortraitShowcaseSectionProps {
  onNavigate: (path: string) => void;
  onContactClick: () => void;
}

export function PortraitShowcaseSection({
  onNavigate,
  onContactClick,
}: PortraitShowcaseSectionProps) {
  const desktopStageRef = useRef<HTMLDivElement | null>(null);
  const [shiftPx, setShiftPx] = useState(290);

  useEffect(() => {
    const updateShift = () => {
      if (typeof window === 'undefined') return;
      const containerW = Math.min(window.innerWidth - 64, 1120);
      setShiftPx(Math.round(containerW * 0.275));
    };
    updateShift();
    window.addEventListener('resize', updateShift, { passive: true });
    return () => window.removeEventListener('resize', updateShift);
  }, []);

  const { scrollYProgress } = useScroll({
    target: desktopStageRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    mass: 0.45,
  });

  const translateX = useTransform(
    smoothProgress,
    (p) => (computePortraitChoreography(p).translateXPercent / 100) * shiftPx
  );
  const rotateY = useTransform(smoothProgress, (p) => computePortraitChoreography(p).rotateY);
  const rotateZ = useTransform(smoothProgress, (p) => computePortraitChoreography(p).rotateZ);
  const scale = useTransform(smoothProgress, (p) => computePortraitChoreography(p).scale);
  const hiOpacity = useTransform(smoothProgress, (p) => computePortraitChoreography(p).hiOpacity);

  return (
    <div className="relative z-10 w-full">
      {/* ==================== DESKTOP (lg+): UNIFIED 3D STICKY PORTRAIT STAGE ==================== */}
      <div ref={desktopStageRef} className="relative hidden lg:block">
        {/* Sticky 3D Flipping Portrait Overlay Layer */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
          <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
            <motion.div
              style={{
                x: translateX,
                scale,
                rotateZ,
              }}
              className="relative perspective-1200 will-change-transform"
            >
              <motion.div
                style={{
                  rotateY,
                }}
                className="relative w-[340px] h-[476px] preserve-3d will-change-transform"
              >
                {/* Front Face: Arvind Thevar Portrait */}
                <div className="absolute inset-0 rounded-[20px] overflow-hidden backface-hidden shadow-[0_24px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] bg-[#D9D9D7]">
                  <SafeImage
                    src={ASSETS.portraitFront}
                    alt="Arvind Thevar portrait"
                    loading="eager"
                    className="w-full h-full object-cover object-[40%_18%] scale-[1.08]"
                  />
                </div>

                {/* Back Face: Infrastructure & Lab Workspace (visible during Services/Expertise section) */}
                <div className="absolute inset-0 rounded-[20px] overflow-hidden backface-hidden rotate-y-180 shadow-[0_24px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)] bg-[#E5E5E7]">
                  <SafeImage
                    src={ASSETS.portraitBackWorkspace}
                    alt="IT infrastructure lab workspace"
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Floating "Hi" / Waving Hand Circle overlapping bottom-left in Hero */}
              <motion.div
                style={{ opacity: hiOpacity }}
                className="pointer-events-auto absolute -left-[58px] -bottom-[26px] z-30"
              >
                <HiBadge size="lg" initialMode="hi" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* BAND 1: HERO */}
        <section
          aria-label="Hero"
          className="relative z-10 min-h-screen flex items-center justify-center px-8 pt-24 pb-16"
        >
          <div className="mx-auto w-full max-w-[1180px] grid grid-cols-[1fr_340px_1fr] items-center gap-7 xl:gap-9">
            {/* Left Side: Role + ARVIND + Intro */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-end -mt-6"
            >
              <div className="flex flex-col items-start max-w-[360px]">
                <p className="font-display text-[22px] xl:text-[26px] font-normal leading-[1.3] uppercase text-[#5E67E6] dark:text-[#D0FF71] mb-1">
                  {PROFILE.roleTitle}
                </p>
                <h1 className="font-display text-[104px] xl:text-[120px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white">
                  {PROFILE.heroLeft}
                </h1>
                <p className="mt-4 text-[15px] font-light leading-[1.6] text-[#5C5C5C] dark:text-white/75">
                  15+ years of real-world enterprise IT infrastructure experience—now in the
                  training room.
                </p>
              </div>
            </motion.div>

            {/* Center Spacer reserved for Sticky Portrait */}
            <div className="h-[476px]" aria-hidden="true" />

            {/* Right Side: THEVAR + Tagline + Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-start pt-10"
            >
              <div className="flex flex-col items-end max-w-[360px]">
                <h1 className="font-display text-[104px] xl:text-[120px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white">
                  {PROFILE.heroRight}
                </h1>
                <p className="mt-4 text-right text-[18px] font-medium leading-[1.45] text-[#303030] dark:text-white">
                  {PROFILE.heroTagline}
                </p>
                <p className="mt-2 text-right text-[15px] font-light leading-[1.6] text-[#5C5C5C] dark:text-white/75">
                  Practical, lab-driven training in Linux, Cisco networking, Windows Server,
                  virtualization and cloud.
                </p>
                <div className="mt-6 flex flex-wrap justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('/upcoming-training')}
                    className="rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-5 py-2.5 text-[14px] font-medium text-white dark:text-[#1A1A1B] transition-colors hover:bg-[#303030] dark:hover:bg-white cursor-pointer"
                  >
                    Explore My Courses
                  </button>
                  <button
                    type="button"
                    onClick={onContactClick}
                    className="rounded-full border border-[#303030]/25 dark:border-white/25 px-5 py-2.5 text-[14px] font-normal text-[#303030] dark:text-white transition-colors hover:bg-[#303030] hover:text-white dark:hover:bg-white dark:hover:text-[#1A1A1B] cursor-pointer"
                  >
                    Book a Free Consultation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* BAND 2: MY EXPERTISE */}
        <section
          aria-label="My Expertise"
          className="relative z-10 min-h-[900px] flex items-center px-8 py-24"
        >
          <div className="mx-auto w-full max-w-[1120px] grid grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[560px]"
            >
              <h2 className="font-display text-[56px] xl:text-[60px] font-bold leading-[1.15] uppercase text-[#303030] dark:text-white">
                MY EXPERTISE
              </h2>
              <p className="mt-4 mb-10 text-[18px] font-light leading-[1.55] text-[#303030] dark:text-white/80 max-w-[490px]">
                Ten core domains. One goal: job-ready skills built through live labs and real
                enterprise configurations.
              </p>
              <ServicesAccordion />
            </motion.div>

            {/* Right open space where the sticky flipped workspace card glides */}
            <div className="h-[520px]" aria-hidden="true" />
          </div>
        </section>

        {/* BAND 3: ABOUT ME */}
        <section
          aria-label="About Me"
          className="relative z-10 min-h-[900px] flex items-center px-8 py-24"
        >
          <div className="mx-auto w-full max-w-[1120px] grid grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[560px]"
            >
              <h2 className="font-display text-[56px] xl:text-[60px] font-bold leading-[1.15] uppercase text-[#303030] dark:text-white">
                ABOUT ME
              </h2>
              <p className="mt-3 text-[18px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                {PROFILE.aboutTagline}
              </p>
              <p className="mt-3 text-[17px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[520px]">
                {PROFILE.aboutSummary}
              </p>

              {/* 3-Column Verified Animated Stats */}
              <div className="mt-10 grid grid-cols-3 gap-6">
                {ABOUT_STATS.map((stat) => (
                  <div key={stat.label}>
                    <div className="font-display text-[56px] font-bold leading-none text-[#5E67E6] dark:text-[#D0FF71]">
                      <CountUpNumber target={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="mt-2.5 text-[15px] font-semibold leading-[1.35] text-[#303030] dark:text-white">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Call / WhatsApp + Email */}
              <div className="mt-10 flex flex-wrap items-start gap-10">
                <div>
                  <p className="text-[16px] font-semibold text-[#303030] dark:text-white">
                    Call / WhatsApp :
                  </p>
                  <a
                    href={PROFILE.phoneHref}
                    className="mt-1 inline-block text-[17px] font-light text-[#303030] dark:text-white/80 hover:text-[#5E67E6] dark:hover:text-[#D0FF71] transition-colors tabular-nums"
                  >
                    {PROFILE.phone}
                  </a>
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#303030] dark:text-white">
                    Email :
                  </p>
                  <a
                    href={`mailto:${PROFILE.email}`}
                    className="mt-1 inline-block text-[17px] font-light text-[#303030] dark:text-white/80 hover:text-[#5E67E6] dark:hover:text-[#D0FF71] transition-colors"
                  >
                    {PROFILE.email}
                  </a>
                </div>
              </div>

              {/* Social Icons */}
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

              {/* My Story Outline Button */}
              <div className="mt-9">
                <OutlineButton onClick={() => onNavigate('/about')}>MY STORY</OutlineButton>
              </div>
            </motion.div>

            {/* Right open space where the sticky flipped-back portrait lands */}
            <div className="h-[520px]" aria-hidden="true" />
          </div>
        </section>
      </div>

      {/* ==================== MOBILE & TABLET (< lg): POLISHED RESPONSIVE STACK ==================== */}
      <div className="lg:hidden">
        {/* Mobile Hero */}
        <section
          aria-label="Hero"
          className="px-5 pt-28 pb-16 flex flex-col items-center text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-[19px] sm:text-[23px] font-normal uppercase tracking-normal text-[#5E67E6] dark:text-[#D0FF71]"
          >
            {PROFILE.heroEyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-1 font-display text-[68px] sm:text-[88px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white"
          >
            {PROFILE.heroLeft}
          </motion.h1>

          {/* Centered Portrait Card + Hi/Wave Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative my-5 w-[240px] sm:w-[290px] aspect-[340/476]"
          >
            <div className="w-full h-full rounded-[20px] overflow-hidden shadow-[0_18px_48px_rgba(0,0,0,0.1)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.45)] bg-[#D9D9D7]">
              <SafeImage
                src={ASSETS.portraitFront}
                alt="Arvind Thevar portrait"
                loading="eager"
                className="w-full h-full object-cover object-[40%_18%] scale-[1.08]"
              />
            </div>
            <div className="absolute -left-7 bottom-7">
              <HiBadge size="md" initialMode="wave" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="font-display text-[68px] sm:text-[88px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white"
          >
            {PROFILE.heroRight}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-3 max-w-[340px] text-[17px] sm:text-[19px] font-medium leading-[1.45] text-[#303030] dark:text-white"
          >
            {PROFILE.heroTagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-2 max-w-[360px] text-[15px] sm:text-[16px] font-light leading-[1.6] text-[#5C5C5C] dark:text-white/80"
          >
            {PROFILE.heroIntro2}
          </motion.p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/upcoming-training')}
              className="rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-6 py-3 text-[14px] font-medium text-white dark:text-[#1A1A1B] min-h-[44px] cursor-pointer"
            >
              Explore My Courses
            </button>
            <button
              type="button"
              onClick={onContactClick}
              className="rounded-full border border-[#303030]/25 dark:border-white/25 px-6 py-3 text-[14px] font-normal text-[#303030] dark:text-white min-h-[44px] cursor-pointer"
            >
              Book a Free Consultation
            </button>
          </div>
        </section>

        {/* Mobile Expertise Section */}
        <section aria-label="My Expertise" className="px-5 sm:px-8 py-16">
          <div className="mx-auto max-w-[680px]">
            <h2 className="font-display text-[44px] sm:text-[54px] font-bold leading-[1.15] uppercase text-[#303030] dark:text-white">
              MY EXPERTISE
            </h2>
            <p className="mt-3 mb-8 text-[16px] sm:text-[18px] font-light leading-[1.55] text-[#303030] dark:text-white/80">
              Ten core domains. One goal: job-ready skills built through live labs and real
              enterprise configurations.
            </p>
            <ServicesAccordion />
          </div>
        </section>

        {/* Mobile About Me Section */}
        <section aria-label="About Me" className="px-5 sm:px-8 py-16">
          <div className="mx-auto max-w-[680px]">
            <h2 className="font-display text-[44px] sm:text-[54px] font-bold leading-[1.15] uppercase text-[#303030] dark:text-white">
              ABOUT ME
            </h2>
            <p className="mt-2.5 text-[16px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
              {PROFILE.aboutTagline}
            </p>
            <p className="mt-3 text-[16px] sm:text-[17px] font-light leading-[1.6] text-[#303030] dark:text-white/80">
              {PROFILE.aboutSummary}
            </p>

            {/* Stacked baseline-aligned stats on mobile */}
            <div className="mt-9 space-y-6">
              {ABOUT_STATS.map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-4">
                  <span className="font-display text-[52px] sm:text-[60px] font-bold leading-none text-[#5E67E6] dark:text-[#D0FF71] min-w-[74px]">
                    <CountUpNumber target={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="text-[17px] sm:text-[18px] font-semibold text-[#303030] dark:text-white">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Contact info */}
            <div className="mt-9 space-y-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[16px] font-semibold text-[#303030] dark:text-white">
                  Call / WhatsApp :
                </span>
                <a
                  href={PROFILE.phoneHref}
                  className="text-[16px] font-light text-[#303030] dark:text-white/80 tabular-nums"
                >
                  {PROFILE.phone}
                </a>
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[16px] font-semibold text-[#303030] dark:text-white">
                  Email :
                </span>
                <a
                  href={`mailto:${PROFILE.email}`}
                  className="text-[16px] font-light text-[#303030] dark:text-white/80"
                >
                  {PROFILE.email}
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="mt-7 flex items-center gap-5">
              {PROFILE.socials.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="p-1 text-[#303030] dark:text-white hover:text-[#5E67E6] dark:hover:text-[#D0FF71] transition-colors"
                >
                  <SocialIcon id={social.id} className="w-[22px] h-[22px]" />
                </a>
              ))}
            </div>

            <div className="mt-8">
              <OutlineButton onClick={() => onNavigate('/about')}>MY STORY</OutlineButton>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
