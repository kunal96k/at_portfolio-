import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { ABOUT_STATS, ASSETS, PROFILE } from '../data/portfolioData';
import { useResponsiveReveal } from '../hooks/useResponsiveReveal';
import {
  computeMobileFlipTransform,
  computeMobileHeroPortraitTransform,
  computePortraitChoreography,
  computeStageHorizontalShift,
  computeTabletChoreography,
  shouldSwapTabletFrontToAbout,
} from '../utils/scrollMath';
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

/**
 * Unified Sticky 3D Portrait Stage for md tablets (768px+) and lg+ desktops.
 * Card glides from Hero center -> right column while flipping 0 -> 180 -> 360 deg.
 */
function TabletDesktopPortraitStage({
  onNavigate,
  onContactClick,
  shiftPx,
  isTablet,
}: PortraitShowcaseSectionProps & { shiftPx: number; isTablet: boolean }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [showTabletAboutFace, setShowTabletAboutFace] = useState(false);
  const reveal = useResponsiveReveal(0.2, 0.6);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (!isTablet) return;
    const nextSwap = shouldSwapTabletFrontToAbout(latest);
    setShowTabletAboutFace((prev) => (prev === nextSwap ? prev : nextSwap));
  });

  useEffect(() => {
    if (!isTablet) {
      setShowTabletAboutFace(false);
    }
  }, [isTablet]);

  const smoothProgress = useSpring(
    scrollYProgress,
    isTablet
      ? { stiffness: 260, damping: 32, mass: 0.25 }
      : { stiffness: 180, damping: 30, mass: 0.45 }
  );

  const getChoreography = (p: number) =>
    isTablet ? computeTabletChoreography(p) : computePortraitChoreography(p);

  const translateX = useTransform(
    smoothProgress,
    (p) => (getChoreography(p).translateXPercent / 100) * shiftPx
  );
  const rotateY = useTransform(smoothProgress, (p) => getChoreography(p).rotateY);
  const rotateZ = useTransform(smoothProgress, (p) => getChoreography(p).rotateZ);
  const scale = useTransform(smoothProgress, (p) => getChoreography(p).scale);
  const hiOpacity = useTransform(smoothProgress, (p) => getChoreography(p).hiOpacity);

  const useDistinctAboutFront = isTablet && showTabletAboutFace;
  const frontFaceSrc = useDistinctAboutFront ? ASSETS.aboutStudio3 : ASSETS.portraitFront;
  const frontFaceAlt = useDistinctAboutFront
    ? 'Corporate and institutional IT training workshop'
    : 'Arvind Thevar portrait';

  return (
    <div ref={stageRef} data-testid="stage-md-lg" className="relative">
      {/* Sticky 3D Flipping Portrait Overlay Layer */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          <motion.div
            data-testid="sticky-portrait-glide"
            style={{
              x: translateX,
              scale,
              rotateZ,
            }}
            className="relative perspective-1200 will-change-transform"
          >
            <motion.div
              data-testid="sticky-portrait-flip"
              style={{
                rotateY,
              }}
              className="relative w-[236px] h-[330px] lg:w-[340px] lg:h-[476px] preserve-3d will-change-transform"
            >
              {/* Front Face: Arvind Portrait in Hero (swaps on md to training workshop in About Me so portrait is not duplicated) */}
              <div className="absolute inset-0 rounded-[20px] overflow-hidden backface-hidden [transform:rotateY(0deg)_translateZ(1px)] shadow-[0_24px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] bg-[#D9D9D7]">
                <SafeImage
                  src={frontFaceSrc}
                  alt={frontFaceAlt}
                  loading="eager"
                  className={
                    useDistinctAboutFront
                      ? 'w-full h-full object-cover'
                      : 'w-full h-full object-cover object-[40%_18%] scale-[1.08]'
                  }
                />
              </div>

              {/* Back Face: Infrastructure & Lab Workspace (visible during Services/Expertise section) */}
              <div className="absolute inset-0 rounded-[20px] overflow-hidden backface-hidden [transform:rotateY(180deg)_translateZ(1px)] shadow-[0_24px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)] bg-[#E5E5E7]">
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
              className="pointer-events-auto absolute -left-[38px] -bottom-[20px] lg:-left-[58px] lg:-bottom-[26px] z-30"
            >
              <HiBadge size="lg" initialMode="hi" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* BAND 1: HERO */}
      <section
        aria-label="Hero"
        className="relative z-10 min-h-screen flex items-center justify-center px-6 lg:px-8 pt-24 pb-16"
      >
        <div className="mx-auto w-full max-w-[1180px] grid grid-cols-[1fr_236px_1fr] lg:grid-cols-[1fr_340px_1fr] items-center gap-4 lg:gap-7 xl:gap-9">
          {/* Left Side: Role + ARVIND + Intro */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-end -mt-4 lg:-mt-6"
          >
            <div className="flex flex-col items-start max-w-[240px] lg:max-w-[360px]">
              <p className="font-display text-[17px] lg:text-[22px] xl:text-[26px] font-normal leading-[1.3] uppercase text-[#5E67E6] dark:text-[#D0FF71] mb-1">
                {PROFILE.roleTitle}
              </p>
              <h1 className="font-display text-[66px] lg:text-[104px] xl:text-[120px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white">
                {PROFILE.heroLeft}
              </h1>
              <p className="mt-3 lg:mt-4 text-[13px] lg:text-[15px] font-light leading-[1.55] lg:leading-[1.6] text-[#5C5C5C] dark:text-white/75">
                15+ years of real-world enterprise IT infrastructure experience—now in the
                training room.
              </p>
            </div>
          </motion.div>

          {/* Center Spacer reserved for Sticky Portrait */}
          <div className="h-[330px] lg:h-[476px]" aria-hidden="true" />

          {/* Right Side: THEVAR + Tagline + Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-start pt-6 lg:pt-10"
          >
            <div className="flex flex-col items-end max-w-[240px] lg:max-w-[360px]">
              <h1 className="font-display text-[66px] lg:text-[104px] xl:text-[120px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white">
                {PROFILE.heroRight}
              </h1>
              <p className="mt-3 lg:mt-4 text-right text-[15px] lg:text-[18px] font-medium leading-[1.45] text-[#303030] dark:text-white">
                {PROFILE.heroTagline}
              </p>
              <p className="mt-2 text-right text-[13px] lg:text-[15px] font-light leading-[1.55] lg:leading-[1.6] text-[#5C5C5C] dark:text-white/75">
                Practical, lab-driven training in Linux, Cisco networking, Windows Server,
                virtualization and cloud.
              </p>
              <div className="mt-5 lg:mt-6 flex flex-wrap justify-end gap-2 lg:gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate('/upcoming-training')}
                  className="rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-3.5 py-2 lg:px-5 lg:py-2.5 text-[12px] lg:text-[14px] font-medium text-white dark:text-[#1A1A1B] transition-colors hover:bg-[#303030] dark:hover:bg-white cursor-pointer"
                >
                  Explore My Courses
                </button>
                <button
                  type="button"
                  onClick={onContactClick}
                  className="rounded-full border border-[#303030]/25 dark:border-white/25 px-3.5 py-2 lg:px-5 lg:py-2.5 text-[12px] lg:text-[14px] font-normal text-[#303030] dark:text-white transition-colors hover:bg-[#303030] hover:text-white dark:hover:bg-white dark:hover:text-[#1A1A1B] cursor-pointer"
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
        className="relative z-10 min-h-[780px] lg:min-h-[900px] flex items-center px-6 lg:px-8 py-20 lg:py-24"
      >
        <div className="mx-auto w-full max-w-[1120px] grid grid-cols-[1.12fr_0.88fr] lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={reveal.viewport}
            transition={{ duration: reveal.duration, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[560px]"
          >
            <h2 className="font-display text-[46px] lg:text-[56px] xl:text-[60px] font-bold leading-[1.15] uppercase text-[#303030] dark:text-white">
              MY EXPERTISE
            </h2>
            <p className="mt-3 lg:mt-4 mb-8 lg:mb-10 text-[16px] lg:text-[18px] font-light leading-[1.55] text-[#303030] dark:text-white/80 max-w-[490px]">
              Ten core domains. One goal: job-ready skills built through live labs and real
              enterprise configurations.
            </p>
            <ServicesAccordion />
          </motion.div>

          {/* Right open space where the sticky flipped workspace card glides */}
          <div className="h-[380px] lg:h-[520px]" aria-hidden="true" />
        </div>
      </section>

      {/* BAND 3: ABOUT ME */}
      <section
        aria-label="About Me"
        className="relative z-10 min-h-[780px] lg:min-h-[900px] flex items-center px-6 lg:px-8 py-20 lg:py-24"
      >
        <div className="mx-auto w-full max-w-[1120px] grid grid-cols-[1.12fr_0.88fr] lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={reveal.viewport}
            transition={{ duration: reveal.duration, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[560px]"
          >
            <h2 className="font-display text-[46px] lg:text-[56px] xl:text-[60px] font-bold leading-[1.15] uppercase text-[#303030] dark:text-white">
              ABOUT ME
            </h2>
            <p className="mt-3 text-[16px] lg:text-[18px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
              {PROFILE.aboutTagline}
            </p>
            <p className="mt-3 text-[15px] lg:text-[17px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[520px]">
              {PROFILE.aboutSummary}
            </p>

            {/* 3-Column Verified Animated Stats */}
            <div className="mt-8 lg:mt-10 grid grid-cols-3 gap-4 lg:gap-6">
              {ABOUT_STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-[44px] lg:text-[56px] font-bold leading-none text-[#5E67E6] dark:text-[#D0FF71]">
                    <CountUpNumber target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 lg:mt-2.5 text-[13px] lg:text-[15px] font-semibold leading-[1.35] text-[#303030] dark:text-white">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Call / WhatsApp + Email */}
            <div className="mt-8 lg:mt-10 flex flex-wrap items-start gap-6 lg:gap-10">
              <div>
                <p className="text-[15px] lg:text-[16px] font-semibold text-[#303030] dark:text-white">
                  Call / WhatsApp :
                </p>
                <a
                  href={PROFILE.phoneHref}
                  className="mt-1 inline-block text-[15px] lg:text-[17px] font-light text-[#303030] dark:text-white/80 hover:text-[#5E67E6] dark:hover:text-[#D0FF71] transition-colors tabular-nums"
                >
                  {PROFILE.phone}
                </a>
              </div>
              <div>
                <p className="text-[15px] lg:text-[16px] font-semibold text-[#303030] dark:text-white">
                  Email :
                </p>
                <a
                  href={`mailto:${PROFILE.email}`}
                  className="mt-1 inline-block text-[15px] lg:text-[17px] font-light text-[#303030] dark:text-white/80 hover:text-[#5E67E6] dark:hover:text-[#D0FF71] transition-colors"
                >
                  {PROFILE.email}
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="mt-7 lg:mt-8 flex items-center gap-5">
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
            <div className="mt-8 lg:mt-9">
              <OutlineButton onClick={() => onNavigate('/about')}>MY STORY</OutlineButton>
            </div>
          </motion.div>

          {/* Right open space where the sticky flipped-back portrait lands */}
          <div className="h-[380px] lg:h-[520px]" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}

/**
 * Scroll-driven 3D flipping card tailored for mobile / sm screens (< 768px).
 * Uses distinct, non-duplicate IT lab & training images (never repeating Arvind's Hero portrait)
 * with explicit 3D face separation and early scroll completion so it flips visibly on screen.
 */
function MobileScrollFlipCard({
  frontSrc,
  frontAlt,
  backSrc,
  backAlt,
  direction = 'front-to-back',
  testId,
  caption,
}: {
  frontSrc: string;
  frontAlt: string;
  backSrc: string;
  backAlt: string;
  direction?: 'front-to-back' | 'back-to-front';
  testId: string;
  caption: string;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    mass: 0.25,
  });

  const rotateY = useTransform(
    smoothProgress,
    (p) => computeMobileFlipTransform(p, direction).rotateY
  );
  const rotateZ = useTransform(
    smoothProgress,
    (p) => computeMobileFlipTransform(p, direction).rotateZ
  );
  const scale = useTransform(
    smoothProgress,
    (p) => computeMobileFlipTransform(p, direction).scale
  );
  const y = useTransform(smoothProgress, (p) => computeMobileFlipTransform(p, direction).y);

  return (
    <div ref={cardRef} className="my-8 flex flex-col items-center">
      <motion.div
        style={{ scale, rotateZ, y }}
        className="relative perspective-1200 will-change-transform"
      >
        <motion.div
          data-testid={testId}
          style={{ rotateY }}
          className="relative w-[228px] sm:w-[270px] aspect-[340/476] preserve-3d will-change-transform"
        >
          {/* Front Face */}
          <div className="absolute inset-0 rounded-[20px] overflow-hidden backface-hidden [transform:rotateY(0deg)_translateZ(1px)] shadow-[0_18px_48px_rgba(0,0,0,0.1)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.45)] bg-[#D9D9D7]">
            <SafeImage
              src={frontSrc}
              alt={frontAlt}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 rounded-[20px] overflow-hidden backface-hidden [transform:rotateY(180deg)_translateZ(1px)] shadow-[0_18px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.5)] bg-[#E5E5E7]">
            <SafeImage
              src={backSrc}
              alt={backAlt}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </motion.div>
      <p className="mt-4 text-center text-[12px] font-medium tracking-[0.04em] uppercase text-[#5C5C5C] dark:text-white/60">
        {caption}
      </p>
    </div>
  );
}

/**
 * Mobile / sm (< 768px) Portrait Showcase Stage with scroll-driven 3D Hero tilt,
 * distinct non-portrait scroll-flipping 3D cards in My Expertise & About Me, and early section reveals.
 */
function MobilePortraitStage({ onNavigate, onContactClick }: PortraitShowcaseSectionProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const reveal = useResponsiveReveal(0.2, 0.55);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const smoothHero = useSpring(heroScroll, {
    stiffness: 260,
    damping: 32,
    mass: 0.25,
  });

  const heroRotateY = useTransform(
    smoothHero,
    (p) => computeMobileHeroPortraitTransform(p).rotateY
  );
  const heroRotateZ = useTransform(
    smoothHero,
    (p) => computeMobileHeroPortraitTransform(p).rotateZ
  );
  const heroScale = useTransform(
    smoothHero,
    (p) => computeMobileHeroPortraitTransform(p).scale
  );
  const heroHiOpacity = useTransform(
    smoothHero,
    (p) => computeMobileHeroPortraitTransform(p).hiOpacity
  );

  return (
    <div data-testid="stage-sm">
      {/* Mobile Hero */}
      <section
        ref={heroRef}
        aria-label="Hero"
        className="px-5 pt-28 pb-14 flex flex-col items-center text-center"
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

        {/* Centered Portrait Card + Scroll-linked 3D Tilt + Hi/Wave Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative my-5 w-[240px] sm:w-[290px] aspect-[340/476] perspective-1200"
        >
          <motion.div
            data-testid="mobile-hero-portrait"
            style={{
              rotateY: heroRotateY,
              rotateZ: heroRotateZ,
              scale: heroScale,
            }}
            className="w-full h-full rounded-[20px] overflow-hidden shadow-[0_18px_48px_rgba(0,0,0,0.1)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.45)] bg-[#D9D9D7] will-change-transform"
          >
            <SafeImage
              src={ASSETS.portraitFront}
              alt="Arvind Thevar portrait"
              loading="eager"
              className="w-full h-full object-cover object-[40%_18%] scale-[1.08]"
            />
          </motion.div>
          <motion.div style={{ opacity: heroHiOpacity }} className="absolute -left-7 bottom-7">
            <HiBadge size="md" initialMode="wave" />
          </motion.div>
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

      {/* Mobile Expertise Section with Single Scroll-Driven 3D Flip Card (Distinct Lab Photos — No Portrait Duplicate) */}
      <section aria-label="My Expertise" className="px-5 sm:px-8 py-14">
        <div className="mx-auto max-w-[680px]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={reveal.viewport}
            transition={{ duration: reveal.duration, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-display text-[44px] sm:text-[54px] font-bold leading-[1.15] uppercase text-[#303030] dark:text-white">
              MY EXPERTISE
            </h2>
            <p className="mt-3 mb-6 text-[16px] sm:text-[18px] font-light leading-[1.55] text-[#303030] dark:text-white/80">
              Ten core domains. One goal: job-ready skills built through live labs and real
              enterprise configurations.
            </p>
          </motion.div>

          <MobileScrollFlipCard
            frontSrc={ASSETS.courseLinux}
            frontAlt="Red Hat Enterprise Linux server lab"
            backSrc={ASSETS.portraitBackWorkspace}
            backAlt="Enterprise IT infrastructure lab workspace"
            direction="front-to-back"
            testId="mobile-flip-expertise"
            caption="Hands-On Enterprise Lab Setup"
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={reveal.viewport}
            transition={{ duration: reveal.duration, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6"
          >
            <ServicesAccordion />
          </motion.div>
        </div>
      </section>

      {/* Mobile About Me Section with Single Scroll-Driven 3D Flip Card (Distinct Training Workshop Photos — No Portrait Duplicate) */}
      <section aria-label="About Me" className="px-5 sm:px-8 py-14">
        <div className="mx-auto max-w-[680px]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={reveal.viewport}
            transition={{ duration: reveal.duration, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-display text-[44px] sm:text-[54px] font-bold leading-[1.15] uppercase text-[#303030] dark:text-white">
              ABOUT ME
            </h2>
            <p className="mt-2.5 text-[16px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
              {PROFILE.aboutTagline}
            </p>
            <p className="mt-3 text-[16px] sm:text-[17px] font-light leading-[1.6] text-[#303030] dark:text-white/80">
              {PROFILE.aboutSummary}
            </p>
          </motion.div>

          <MobileScrollFlipCard
            frontSrc={ASSETS.aboutStudio1}
            frontAlt="Hands-on server and network troubleshooting console"
            backSrc={ASSETS.aboutStudio3}
            backAlt="Corporate and institutional IT training workshop"
            direction="front-to-back"
            testId="mobile-flip-about"
            caption="15+ Years Infrastructure Mentorship"
          />

          {/* Stacked baseline-aligned stats on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={reveal.viewport}
            transition={{ duration: reveal.duration, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 space-y-6"
          >
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
          </motion.div>

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
  );
}

export function PortraitShowcaseSection({
  onNavigate,
  onContactClick,
}: PortraitShowcaseSectionProps) {
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const updateViewport = () => {
      if (typeof window === 'undefined') return;
      setViewportWidth(window.innerWidth);
    };
    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const isTabletOrDesktop = viewportWidth >= 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
  const shiftPx = computeStageHorizontalShift(viewportWidth);

  return (
    <div className="relative z-10 w-full">
      {isTabletOrDesktop ? (
        <TabletDesktopPortraitStage
          onNavigate={onNavigate}
          onContactClick={onContactClick}
          shiftPx={shiftPx}
          isTablet={isTablet}
        />
      ) : (
        <MobilePortraitStage
          onNavigate={onNavigate}
          onContactClick={onContactClick}
        />
      )}
    </div>
  );
}
