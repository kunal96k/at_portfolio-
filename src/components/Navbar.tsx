import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { ASSETS } from '../data/portfolioData';
import type { AppRoute } from '../utils/scrollMath';
import { SafeImage } from './SafeImage';

interface NavbarProps {
  route: AppRoute;
  onNavigate: (path: string) => void;
  onContactClick: () => void;
}

interface NavLinkItem {
  label: string;
  path: string;
  pages: AppRoute['page'][];
}

const NAV_LINKS: NavLinkItem[] = [
  { label: 'Home', path: '/', pages: ['home'] },
  { label: 'About Us', path: '/about', pages: ['about'] },
  { label: 'Upcoming Training', path: '/upcoming-training', pages: ['upcoming-training'] },
  { label: 'Notes & Resources', path: '/resources', pages: ['resources'] },
  { label: 'Testimonials', path: '/testimonials', pages: ['testimonials'] },
  { label: 'Blogs', path: '/blogs', pages: ['blogs', 'blog-detail'] },
  { label: 'Gallery', path: '/gallery', pages: ['gallery'] },
];

function RollingNavLink({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-6 overflow-hidden px-1 text-[13.5px] xl:text-[14.5px] leading-6 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71] rounded"
    >
      <span
        className={`block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full ${
          active
            ? 'text-[#5E67E6] dark:text-[#D0FF71] font-semibold'
            : 'text-[#303030] dark:text-white/90 font-light'
        }`}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className="block text-[#5E67E6] dark:text-[#D0FF71] font-medium transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full"
      >
        {label}
      </span>
    </button>
  );
}

export function Navbar({ route, onNavigate, onContactClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktopHovered, setIsDesktopHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const desktopNavRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [route.page]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const showCompactDesktop = isScrolled && !isDesktopHovered;

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  return (
    <>
      {/* Desktop Floating Dynamic Pill Navbar (lg+) */}
      <header className="fixed top-5 left-0 right-0 z-40 hidden lg:flex justify-center pointer-events-none px-4">
        <motion.nav
          ref={desktopNavRef}
          aria-label="Primary Navigation"
          layout
          onMouseEnter={() => setIsDesktopHovered(true)}
          onMouseLeave={() => setIsDesktopHovered(false)}
          onClick={() => {
            if (showCompactDesktop) setIsDesktopHovered(true);
          }}
          transition={{ type: 'spring', stiffness: 360, damping: 32 }}
          className="pointer-events-auto relative flex items-center rounded-full border border-[#E5E5E5] dark:border-[#343436] bg-white/94 dark:bg-[#1C1C1D]/94 backdrop-blur-md p-2 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
        >
          {/* Logo Avatar */}
          <button
            type="button"
            onClick={() => handleNavClick('/')}
            aria-label="Arvind Thevar Home"
            className="w-10 h-10 rounded-full overflow-hidden shrink-0 cursor-pointer ring-1 ring-black/5 dark:ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
          >
            <SafeImage
              src={ASSETS.avatar}
              alt="Arvind Thevar Logo Avatar"
              loading="eager"
              className="w-full h-full object-cover object-[36%_18%] scale-[1.18]"
            />
          </button>

          <AnimatePresence mode="wait" initial={false}>
            {showCompactDesktop ? (
              <motion.button
                key="compact-status"
                type="button"
                aria-label="Expand navigation menu — Open for training"
                onClick={() => setIsDesktopHovered(true)}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2.5 pl-3.5 pr-3 overflow-hidden whitespace-nowrap cursor-pointer"
              >
                <span className="text-[15px] font-light text-[#303030] dark:text-white/90">
                  Open for training
                </span>
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <span className="animate-available-pulse absolute inline-flex h-4 w-4 rounded-full bg-[#0BDE66]/35" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0BDE66]" />
                </span>
              </motion.button>
            ) : (
              <motion.div
                key="expanded-links"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 xl:gap-5 pl-4 pr-1"
              >
                {/* All Direct Nav Links — No Sub-Dropdowns */}
                <div className="flex items-center gap-3 xl:gap-4">
                  {NAV_LINKS.map((link) => (
                    <RollingNavLink
                      key={link.path}
                      label={link.label}
                      active={link.pages.includes(route.page)}
                      onClick={() => handleNavClick(link.path)}
                    />
                  ))}
                </div>

                {/* Action Buttons: Contact & Explore Training */}
                <div className="flex items-center gap-2 shrink-0 pl-1">
                  <button
                    type="button"
                    onClick={onContactClick}
                    className="rounded-full border border-[#303030]/20 dark:border-white/25 bg-transparent px-3.5 xl:px-4 py-2 text-[13.5px] xl:text-[14px] font-normal text-[#303030] dark:text-white transition-colors duration-200 hover:border-[#303030] hover:bg-[#303030] hover:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-[#1A1A1B] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
                  >
                    Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/upcoming-training')}
                    className="rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-4 xl:px-5 py-2 text-[13.5px] xl:text-[14px] font-medium text-white dark:text-[#1A1A1B] transition-colors duration-200 hover:bg-[#303030] dark:hover:bg-white cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
                  >
                    Explore Training
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </header>

      {/* Mobile & Tablet Floating Pill Navbar + Expanding Card (< lg) */}
      <header className="fixed top-4 left-0 right-0 z-40 flex lg:hidden justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[356px]">
          <motion.nav
            aria-label="Mobile Navigation"
            layout
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className={`border border-[#E5E5E5] dark:border-[#343436] bg-white/92 dark:bg-[#1E1E1F]/94 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)] overflow-hidden ${
              mobileMenuOpen ? 'rounded-[28px] p-3.5' : 'rounded-full p-2'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleNavClick('/')}
                aria-label="Arvind Thevar Home"
                className="w-10 h-10 rounded-full overflow-hidden shrink-0 cursor-pointer ring-1 ring-black/5 dark:ring-white/10"
              >
                <SafeImage
                  src={ASSETS.avatar}
                  alt="Arvind Thevar Logo Avatar"
                  loading="eager"
                  className="w-full h-full object-cover object-[36%_18%] scale-[1.18]"
                />
              </button>

              {!mobileMenuOpen && (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[15px] font-light text-[#303030] dark:text-white/90 truncate">
                    Open for training
                  </span>
                  <span className="relative flex h-6 w-6 items-center justify-center shrink-0">
                    <span className="animate-available-pulse absolute inline-flex h-5 w-5 rounded-full bg-[#0BDE66]/25" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0BDE66]" />
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="w-10 h-10 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <span className="flex flex-col gap-1.5 w-4" aria-hidden="true">
                    <span className="h-[1.8px] w-full bg-current rounded-full" />
                    <span className="h-[1.8px] w-full bg-current rounded-full" />
                  </span>
                )}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="max-h-[75vh] overflow-y-auto flex flex-col items-stretch gap-1 pt-5 pb-2 px-1">
                    {NAV_LINKS.map((link) => {
                      const active = link.pages.includes(route.page);
                      return (
                        <button
                          key={link.path}
                          type="button"
                          onClick={() => handleNavClick(link.path)}
                          className={`w-full text-center text-[16px] transition-colors py-2 min-h-[44px] rounded-[14px] cursor-pointer ${
                            active
                              ? 'text-[#5E67E6] dark:text-[#D0FF71] font-semibold bg-[#5E67E6]/8 dark:bg-[#D0FF71]/10'
                              : 'text-[#303030] dark:text-white/90 font-light hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2D]'
                          }`}
                        >
                          {link.label}
                        </button>
                      );
                    })}

                    {/* Mobile CTA Buttons: Contact & Explore Training */}
                    <div className="mt-3 pt-3 border-t border-[#E5E5E5] dark:border-[#343436] grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onContactClick();
                        }}
                        className="rounded-full border border-[#303030]/25 dark:border-white/25 bg-transparent text-[#303030] dark:text-white px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-[#303030] hover:text-white dark:hover:bg-white dark:hover:text-[#1A1A1B] cursor-pointer min-h-[44px]"
                      >
                        Contact
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavClick('/upcoming-training')}
                        className="rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] px-4 py-2.5 text-[14px] font-medium transition-opacity hover:opacity-90 cursor-pointer min-h-[44px]"
                      >
                        Explore Training
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </div>
      </header>
    </>
  );
}
