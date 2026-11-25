import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { ASSETS, PROFILE } from '../data/portfolioData';
import type { AppRoute } from '../utils/scrollMath';
import { SafeImage } from './SafeImage';
import { SocialIcon } from './SocialIcons';

interface NavbarProps {
  route: AppRoute;
  onNavigate: (path: string) => void;
  onContactClick: () => void;
}

interface NavItem {
  label: string;
  href: string;
  page: AppRoute['page'];
  matchPages?: AppRoute['page'][];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', page: 'home' },
  { label: 'About Us', href: '/about', page: 'about' },
  { label: 'Upcoming Batches', href: '/upcoming-training', page: 'upcoming-training' },
  { label: 'Notes', href: '/resources', page: 'resources' },
  { label: 'Testimonials', href: '/testimonials', page: 'testimonials' },
  { label: 'Blogs', href: '/blogs', page: 'blogs', matchPages: ['blogs', 'blog-detail'] },
  { label: 'Gallery', href: '/gallery', page: 'gallery' },
];

function RollingNavLink({
  label,
  href,
  active,
  onClick,
}: {
  label: string;
  href: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="group relative block h-6 overflow-hidden px-0.5 text-[14px] xl:text-[15px] font-normal leading-6 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F58DF] dark:focus-visible:ring-[#D0FF71] rounded"
    >
      <span
        className={`block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full ${
          active
            ? 'text-[#4F58DF] dark:text-[#D0FF71] font-semibold'
            : 'text-[#303030] dark:text-white/90'
        }`}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className="block text-[#4F58DF] dark:text-[#D0FF71] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full"
      >
        {label}
      </span>
    </a>
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
    const onPointerDown = (e: MouseEvent) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target as Node)) {
        setIsDesktopHovered(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, []);

  const showCompactDesktop = isScrolled && !isDesktopHovered;

  const isNavItemActive = (item: NavItem) => {
    if (item.matchPages) {
      return item.matchPages.includes(route.page);
    }
    return route.page === item.page;
  };

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  return (
    <header>
      {/* Desktop Floating Dynamic Pill Navbar (lg+) */}
      <div className="fixed top-5 left-0 right-0 z-40 hidden lg:flex justify-center pointer-events-none px-4">
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
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('/');
            }}
            aria-label="Arvind Thevar Home"
            className="w-10 h-10 rounded-full overflow-hidden shrink-0 cursor-pointer ring-1 ring-black/5 dark:ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F58DF] dark:focus-visible:ring-[#D0FF71]"
          >
            <SafeImage
              src={ASSETS.avatar}
              alt="Arvind Thevar Logo Avatar"
              variant="avatar"
              loading="eager"
              className="w-full h-full object-cover object-[36%_18%] scale-[1.18]"
            />
          </a>

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
                <span className="text-[15px] font-normal text-[#303030] dark:text-white/90">
                  Open for training
                </span>
                <span className="relative flex h-5 w-5 items-center justify-center" aria-hidden="true">
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
                className="flex items-center gap-4 xl:gap-6 pl-4 xl:pl-5 pr-1"
              >
                {/* Flat Nav Items (No Dropdowns) */}
                <div className="flex items-center gap-3 xl:gap-4">
                  {NAV_ITEMS.map((item) => (
                    <RollingNavLink
                      key={item.href}
                      label={item.label}
                      href={item.href}
                      active={isNavItemActive(item)}
                      onClick={() => handleNavClick(item.href)}
                    />
                  ))}
                </div>

                {/* Action Buttons: Contact & Explore Training */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onContactClick}
                    className="rounded-full border border-[#303030]/25 dark:border-white/25 bg-transparent px-3.5 xl:px-4 py-1.5 xl:py-2 text-[13.5px] xl:text-[14px] font-normal text-[#303030] dark:text-white transition-colors duration-200 hover:border-[#303030] hover:bg-[#303030] hover:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-[#1A1A1B] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F58DF] dark:focus-visible:ring-[#D0FF71]"
                  >
                    Contact
                  </button>
                  <a
                    href="/upcoming-training"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick('/upcoming-training');
                    }}
                    className="rounded-full bg-[#4F58DF] dark:bg-[#D0FF71] px-4 xl:px-5 py-1.5 xl:py-2 text-[13.5px] xl:text-[14px] font-medium text-white dark:text-[#1A1A1B] transition-colors duration-200 hover:bg-[#303030] dark:hover:bg-white cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F58DF] dark:focus-visible:ring-[#D0FF71]"
                  >
                    Explore Training
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>

      {/* Mobile & Tablet Floating Pill Navbar + Expanding Frosted Card (< lg) */}
      <div className="fixed top-4 left-0 right-0 z-40 flex lg:hidden justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[356px]">
          <motion.nav
            aria-label="Mobile Navigation"
            layout
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className={`border border-[#E5E5E5] dark:border-[#343436] bg-white/94 dark:bg-[#1E1E1F]/94 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)] overflow-hidden ${
              mobileMenuOpen ? 'rounded-[28px] p-3.5' : 'rounded-full p-2'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('/');
                }}
                aria-label="Arvind Thevar Home"
                className="w-10 h-10 rounded-full overflow-hidden shrink-0 cursor-pointer ring-1 ring-black/5 dark:ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F58DF] dark:focus-visible:ring-[#D0FF71]"
              >
                <SafeImage
                  src={ASSETS.avatar}
                  alt="Arvind Thevar Logo Avatar"
                  variant="avatar"
                  loading="eager"
                  className="w-full h-full object-cover object-[36%_18%] scale-[1.18]"
                />
              </a>

              {!mobileMenuOpen && (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[15px] font-normal text-[#303030] dark:text-white/90 truncate">
                    Open for training
                  </span>
                  <span className="relative flex h-6 w-6 items-center justify-center shrink-0" aria-hidden="true">
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
                className="w-11 h-11 rounded-full bg-[#4F58DF] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F58DF] dark:focus-visible:ring-[#D0FF71]"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
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
                    {/* Flat Nav Items (No Dropdowns) */}
                    {NAV_ITEMS.map((item) => {
                      const active = isNavItemActive(item);
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(item.href);
                          }}
                          className={`flex items-center justify-center w-full text-center text-[16px] transition-colors py-2.5 min-h-[44px] rounded-[14px] cursor-pointer ${
                            active
                              ? 'text-[#4F58DF] dark:text-[#D0FF71] font-semibold bg-[#4F58DF]/10 dark:bg-[#D0FF71]/10'
                              : 'text-[#303030] dark:text-white/90 font-normal hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2D]'
                          }`}
                        >
                          {item.label}
                        </a>
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
                      <a
                        href="/upcoming-training"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick('/upcoming-training');
                        }}
                        className="flex items-center justify-center rounded-full bg-[#4F58DF] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] px-4 py-2.5 text-[14px] font-medium transition-opacity hover:opacity-90 cursor-pointer min-h-[44px]"
                      >
                        Explore Training
                      </a>
                    </div>

                    {/* Social Media Links in Mobile Drawer */}
                    <div className="mt-3 pt-3 border-t border-[#E5E5E5] dark:border-[#343436] flex items-center justify-center gap-3" aria-label="Social media links">
                      {PROFILE.socials.map((social) => (
                        <a
                          key={social.id}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${social.label} (opens in a new tab)`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-[#2C2C2D] text-[#303030] dark:text-white hover:bg-[#4F58DF] hover:text-white dark:hover:bg-[#D0FF71] dark:hover:text-[#1A1A1B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F58DF] dark:focus-visible:ring-[#D0FF71]"
                        >
                          <SocialIcon id={social.id} className="w-4 h-4" />
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </div>
      </div>
    </header>
  );
}
