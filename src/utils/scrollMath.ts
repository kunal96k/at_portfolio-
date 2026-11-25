export interface PortraitTransformState {
  /** Horizontal offset as percentage of portrait container width (0 = centered in hero, 100 = right column) */
  translateXPercent: number;
  /** 3D Y-axis rotation in degrees: 0 (front) -> 180 (back workspace in Services) -> 360 (front again in About) */
  rotateY: number;
  /** Playful Z-axis tilt in degrees matching Portavia scroll motion */
  rotateZ: number;
  /** Scale subtle breathing */
  scale: number;
  /** Opacity of the floating Hi badge (1 in Hero, fades out as user scrolls into Services) */
  hiOpacity: number;
}

export interface ContactFormValues {
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
}

export interface ContactFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
}

export type AppRoute =
  | { page: 'home' }
  | { page: 'about' }
  | { page: 'upcoming-training' }
  | { page: 'training-course'; slug: string }
  | { page: 'it-services' }
  | { page: 'resources' }
  | { page: 'testimonials' }
  | { page: 'gallery' }
  | { page: 'projects' }
  | { page: 'project-detail'; slug: string }
  | { page: 'blogs' }
  | { page: 'blog-detail'; slug: string }
  | { page: 'contact' }
  | { page: 'privacy-policy' }
  | { page: 'not-found' };

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 === edge0) return x < edge0 ? 0 : 1;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Pure scroll choreography math for the sticky 3D portrait card across
 * Hero (0.0 - 0.15) -> Services (0.42 - 0.58) -> About Me (0.85 - 1.0).
 */
export function computePortraitChoreography(progress: number): PortraitTransformState {
  const p = clamp(progress, 0, 1);

  // Move from center (0) to right column (1) during Hero -> Services transition
  const shiftPhase = smoothstep(0.06, 0.42, p);
  const translateXPercent = lerp(0, 100, shiftPhase);

  // First 180deg flip (front -> workspace back) across Hero -> Services
  const flip1 = smoothstep(0.08, 0.44, p);
  // Second 180deg flip (workspace back -> front portrait) across Services -> About Me
  const flip2 = smoothstep(0.56, 0.88, p);
  const rotateY = flip1 * 180 + flip2 * 180;

  // Z-tilt: 0deg in Hero -> +6.5deg in Services -> +4deg in About Me
  let rotateZ = 0;
  if (p < 0.5) {
    rotateZ = lerp(0, 6.5, smoothstep(0.08, 0.45, p));
  } else {
    rotateZ = lerp(6.5, 3.8, smoothstep(0.55, 0.9, p));
  }

  // Subtle scale depth during mid-flip
  const flipMid1 = Math.sin(flip1 * Math.PI);
  const flipMid2 = Math.sin(flip2 * Math.PI);
  const scale = 1 - 0.05 * Math.max(flipMid1, flipMid2);

  // Floating Hi badge fades out cleanly as soon as scroll starts leaving hero
  const hiOpacity = 1 - smoothstep(0.02, 0.16, p);

  return {
    translateXPercent,
    rotateY,
    rotateZ,
    scale,
    hiOpacity,
  };
}

/**
 * Faster, earlier scroll choreography tailored specifically for md tablets (768px–1023px)
 * so the sticky card finishes shifting and flipping right as My Expertise and About Me
 * enter the viewport instead of lagging behind scroll.
 */
export function computeTabletChoreography(progress: number): PortraitTransformState {
  const p = clamp(progress, 0, 1);

  const shiftPhase = smoothstep(0.03, 0.32, p);
  const translateXPercent = lerp(0, 100, shiftPhase);

  const flip1 = smoothstep(0.04, 0.34, p);
  const flip2 = smoothstep(0.5, 0.78, p);
  const rotateY = flip1 * 180 + flip2 * 180;

  let rotateZ = 0;
  if (p < 0.48) {
    rotateZ = lerp(0, 5.5, smoothstep(0.04, 0.34, p));
  } else {
    rotateZ = lerp(5.5, 3.2, smoothstep(0.5, 0.78, p));
  }

  const flipMid1 = Math.sin(flip1 * Math.PI);
  const flipMid2 = Math.sin(flip2 * Math.PI);
  const scale = 1 - 0.045 * Math.max(flipMid1, flipMid2);

  const hiOpacity = 1 - smoothstep(0.01, 0.12, p);

  return {
    translateXPercent,
    rotateY,
    rotateZ,
    scale,
    hiOpacity,
  };
}

/**
 * On md tablets (768px–1023px), once the sticky card is fully flipped to its back face
 * in My Expertise (progress >= 0.46), swap the hidden front face image away from
 * Arvind's Hero portrait so About Me displays a distinct training image instead of
 * duplicating the Hero portrait.
 */
export function shouldSwapTabletFrontToAbout(progress: number): boolean {
  return clamp(progress, 0, 1) >= 0.46;
}

/**
 * Computes the horizontal glide distance (in px) from viewport center to the
 * right column for the unified sticky 3D portrait stage on md (768px+) and lg (1024px+).
 */
export function computeStageHorizontalShift(viewportWidth: number): number {
  if (viewportWidth < 768) return 0;
  if (viewportWidth < 1024) {
    const containerW = Math.max(viewportWidth - 48, 320);
    return Math.round(containerW * 0.285);
  }
  const containerW = Math.min(viewportWidth - 64, 1120);
  return Math.round(containerW * 0.275);
}

export interface MobileHeroPortraitState {
  rotateY: number;
  rotateZ: number;
  scale: number;
  hiOpacity: number;
}

/**
 * Subtle scroll-linked 3D tilt & badge fade as the mobile (< md) Hero scrolls away.
 */
export function computeMobileHeroPortraitTransform(progress: number): MobileHeroPortraitState {
  const p = clamp(progress, 0, 1);
  const t = smoothstep(0.03, 0.72, p);
  return {
    rotateY: lerp(0, 22, t),
    rotateZ: lerp(0, 3.5, t),
    scale: lerp(1, 0.95, t),
    hiOpacity: 1 - smoothstep(0.02, 0.3, p),
  };
}

export interface MobileCardFlipState {
  rotateY: number;
  rotateZ: number;
  scale: number;
  y: number;
}

/**
 * Scroll-driven 3D flip choreography for mobile (< md) cards.
 * Completes the 180deg flip early (progress 0.06 -> 0.44) so the flip plays visibly
 * as the card enters the reading zone rather than firing late off-screen.
 */
export function computeMobileFlipTransform(
  progress: number,
  direction: 'front-to-back' | 'back-to-front'
): MobileCardFlipState {
  const p = clamp(progress, 0, 1);
  const flipT = smoothstep(0.06, 0.44, p);
  const rotateY =
    direction === 'front-to-back' ? lerp(0, 180, flipT) : lerp(180, 360, flipT);
  const rotateZ =
    direction === 'front-to-back' ? lerp(-2.5, 3, flipT) : lerp(3, -2, flipT);
  const scale = 1 - 0.045 * Math.sin(flipT * Math.PI);
  const y = lerp(12, -8, p);

  return { rotateY, rotateZ, scale, y };
}

export interface ScrollRevealConfig {
  viewport: {
    once: true;
    amount: number;
    margin?: string;
  };
  duration: number;
  isCompactViewport: boolean;
}

/**
 * Returns viewport trigger config for whileInView animations:
 * - On sm & md (< 1024px): triggers immediately as elements approach/enter the viewport
 *   with a faster duration so scroll animations never fire late or off-screen.
 * - On lg+ (>= 1024px): preserves the original desktop threshold and duration.
 */
export function getScrollRevealConfig(
  viewportWidth: number,
  lgAmount = 0.2,
  lgDuration = 0.6
): ScrollRevealConfig {
  if (viewportWidth < 1024) {
    return {
      viewport: {
        once: true,
        amount: 0.02,
        margin: '80px 0px 80px 0px',
      },
      duration: Math.min(lgDuration, 0.38),
      isCompactViewport: true,
    };
  }
  return {
    viewport: {
      once: true,
      amount: lgAmount,
    },
    duration: lgDuration,
    isCompactViewport: false,
  };
}

export interface StackedCardTransformState {
  /** Scale of the pinned card as subsequent cards slide over it (1 -> ~0.89) */
  scale: number;
  /** Subtle upward tuck in pixels so the stacked card peeks neatly behind the active card */
  y: number;
  /** Extra dark veil opacity (0 -> ~0.32) giving crisp foreground depth separation */
  dimOpacity: number;
}

/**
 * Pure scroll choreography math matching Portavia's Featured Projects sticky card deck:
 * Each card pins cleanly near the top of the viewport, and as the next card rises over it,
 * the pinned card smoothly scales down from top-center and dims softly into the background stack.
 */
export function computeStackedCardTransform(
  scrollProgress: number,
  index: number,
  totalCards: number
): StackedCardTransformState {
  if (totalCards <= 1 || index >= totalCards - 1) {
    return { scale: 1, y: 0, dimOpacity: 0 };
  }

  const p = clamp(scrollProgress, 0, 1);
  const steps = totalCards - 1;
  const segmentStart = index / steps;
  const segmentEnd = (index + 1) / steps;

  // Primary scale-down as the very next card glides over this card
  const localCover = smoothstep(segmentStart, segmentEnd, p);

  // Gentle secondary recession as further cards stack on top
  const remainingRange = Math.max(1 - segmentEnd, 0.0001);
  const furtherStack = p > segmentEnd ? clamp((p - segmentEnd) / remainingRange, 0, 1) : 0;

  const scale = 1 - 0.08 * localCover - 0.03 * furtherStack;
  const y = -12 * localCover - 8 * furtherStack || 0;
  const dimOpacity = 0.22 * localCover + 0.1 * furtherStack;

  return { scale, y, dimOpacity };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  return /^\+?(?:[0-9][\s().-]*){7,20}$/.test(phone.trim());
}

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter your name.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (values.name.trim().length > 300) {
    errors.name = 'Name cannot exceed 300 characters.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (values.email.trim().length > 300) {
    errors.email = 'Email cannot exceed 300 characters.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (values.phone && values.phone.trim()) {
    if (values.phone.trim().length > 300) {
      errors.phone = 'Phone number cannot exceed 300 characters.';
    } else if (!isValidPhone(values.phone)) {
      errors.phone = 'Please provide a valid phone number (digits and optional + prefix).';
    }
  }

  if (!values.service.trim()) {
    errors.service = 'Please select a service.';
  } else if (values.service.trim().length > 300) {
    errors.service = 'Service cannot exceed 300 characters.';
  }

  if (!values.message.trim()) {
    errors.message = 'Please tell me a bit about your project.';
  } else if (values.message.trim().length < 10) {
    errors.message = 'Please provide at least 10 characters of detail.';
  } else if (values.message.trim().length > 3000) {
    errors.message = 'Message cannot exceed 3000 characters.';
  }

  return errors;
}

export function validateNewsletterEmail(email: string): string | null {
  if (!email.trim()) return 'Please enter your email address.';
  if (!isValidEmail(email)) return 'Please enter a valid email address.';
  return null;
}

export function parseRoute(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '') {
    return { page: 'home' };
  }
  if (clean === '/about') {
    return { page: 'about' };
  }
  if (clean === '/upcoming-training' || clean === '/upcoming-batches') {
    return { page: 'upcoming-training' };
  }
  if (clean.startsWith('/training/')) {
    const slug = clean.slice('/training/'.length);
    if (slug) return { page: 'training-course', slug };
  }
  if (clean === '/contact') {
    return { page: 'contact' };
  }
  if (clean === '/privacy-policy') {
    return { page: 'privacy-policy' };
  }
  if (clean === '/it-services') {
    return { page: 'it-services' };
  }
  if (clean === '/resources') {
    return { page: 'resources' };
  }
  if (clean === '/testimonials') {
    return { page: 'testimonials' };
  }
  if (clean === '/gallery') {
    return { page: 'gallery' };
  }
  if (clean === '/projects') {
    return { page: 'projects' };
  }
  if (clean.startsWith('/projects/')) {
    const slug = clean.slice('/projects/'.length);
    if (slug) return { page: 'project-detail', slug };
  }
  if (clean === '/blogs' || clean === '/blog') {
    return { page: 'blogs' };
  }
  if (clean.startsWith('/blogs/')) {
    const slug = clean.slice('/blogs/'.length);
    if (slug) return { page: 'blog-detail', slug };
  }
  if (clean.startsWith('/blog/')) {
    const slug = clean.slice('/blog/'.length);
    if (slug) return { page: 'blog-detail', slug };
  }
  if (clean === '/404') {
    return { page: 'not-found' };
  }
  return { page: 'not-found' };
}

export function formatCounterValue(current: number, target: number, suffix: string): string {
  const rounded = Math.round(clamp(current, 0, target));
  return `${rounded}${suffix}`;
}
