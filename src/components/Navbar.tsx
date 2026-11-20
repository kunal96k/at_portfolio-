import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, X } from 'lucide-react';
import { ASSETS } from '../data/portfolioData';
import type { AppRoute } from '../utils/scrollMath';
import { SafeImage } from './SafeImage';

interface NavbarProps {
  route: AppRoute;
  onNavigate: (path: string) => void;
  onContactClick: () => void;
}

type DropdownId = 'training' | 'resources';

interface DropdownLinkItem {
  label: string;
  description: string;
  path: string;
  pages: AppRoute['page'][];
}

const DROPDOWN_MENUS: Record<DropdownId, { label: string; items: DropdownLinkItem[] }> = {
  training: {
    label: 'Training',
    items: [
      {
        label: 'Upcoming Training',
        description: 'Red Hat Linux, Cisco CCNA & AWS batch schedules',
        path: '/upcoming-training',
        pages: ['upcoming-training'],
      },
      {
        label: 'Corporate & Labs',
        description: 'Institutional programs & hands-on lab tracks',
        path: '/projects',
        pages: ['projects', 'project-detail'],
      },
    ],
  },
  resources: {
    label: 'Resources',
    items: [
      {
        label: 'Notes & Resources',
        description: 'Study materials, notes & hands-on lab sections',
        path: '/resources',
        pages: ['resources'],
      },
      {
        label: 'Student Testimonials',
        description: 'Student feedback & institutional training record',
        path: '/testimonials',
        pages: ['testimonials'],
      },
      {
        label: 'Blogs',
        description: 'Linux, Cisco networking, cloud & troubleshooting guides',
        path: '/blogs',
        pages: ['blogs', 'blog-detail'],
      },
      {
        label: 'Gallery',
        description: 'Training environments, labs & technical sessions',
        path: '/gallery',
        pages: ['gallery'],
      },
    ],
  },
};

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
      className="group relative h-6 overflow-hidden px-0.5 text-[15px] font-light leading-6 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71] rounded"
    >
      <span
        className={`block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full ${
          active
            ? 'text-[#5E67E6] dark:text-[#D0FF71] font-medium'
            : 'text-[#303030] dark:text-white/90'
        }`}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className="block text-[#5E67E6] dark:text-[#D0FF71] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full"
      >
        {label}
      </span>
    </button>
  );
}

export function Navbar({ route, onNavigate, onContactClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktopHovered, setIsDesktopHovered] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownId | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<DropdownId | null>(null);
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const hoverOpenedAtRef = useRef<{ id: DropdownId; time: number } | null>(null);

  const openDropdownByHover = (id: DropdownId) => {
    hoverOpenedAtRef.current = { id, time: Date.now() };
    setOpenDropdown(id);
  };

  const toggleDropdownByClick = (id: DropdownId) => {
    const hoverInfo = hoverOpenedAtRef.current;
    const justOpenedByHover =
      hoverInfo !== null && hoverInfo.id === id && Date.now() - hoverInfo.time < 500;
    hoverOpenedAtRef.current = null;
    if (justOpenedByHover) {
      setOpenDropdown(id);
      return;
    }
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

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
    setMobileDropdown(null);
    setOpenDropdown(null);
  }, [route.page]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    const onPointerDown = (e: MouseEvent) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, []);

  const showCompactDesktop = isScrolled && !isDesktopHovered && openDropdown === null;

  const isDropdownActive = (id: DropdownId) =>
    DROPDOWN_MENUS[id].items.some((item) => item.pages.includes(route.page));

  const isItemActive = (pages: AppRoute['page'][]) => pages.includes(route.page);

  const handleNavClick = (path: string) => {
    hoverOpenedAtRef.current = null;
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    setMobileDropdown(null);
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
          onMouseLeave={() => {
            setIsDesktopHovered(false);
            setOpenDropdown(null);
            hoverOpenedAtRef.current = null;
          }}
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
                className="flex items-center gap-5 xl:gap-6 pl-5 pr-1"
              >
                <div className="flex items-center gap-4 xl:gap-5">
                  <RollingNavLink
                    label="Home"
                    active={route.page === 'home'}
                    onClick={() => handleNavClick('/')}
                  />
                  <RollingNavLink
                    label="About Us"
                    active={route.page === 'about'}
                    onClick={() => handleNavClick('/about')}
                  />

                  {/* Sub-Dropdown 1: Training */}
                  <div
                    className="relative"
                    onMouseEnter={() => openDropdownByHover('training')}
                    onMouseLeave={() =>
                      setOpenDropdown((prev) => (prev === 'training' ? null : prev))
                    }
                  >
                    <button
                      type="button"
                      aria-expanded={openDropdown === 'training'}
                      aria-haspopup="menu"
                      onClick={() => toggleDropdownByClick('training')}
                      className={`inline-flex items-center gap-1 h-6 px-0.5 text-[15px] leading-6 cursor-pointer whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71] rounded ${
                        isDropdownActive('training') || openDropdown === 'training'
                          ? 'text-[#5E67E6] dark:text-[#D0FF71] font-medium'
                          : 'text-[#303030] dark:text-white/90 font-light hover:text-[#5E67E6] dark:hover:text-[#D0FF71]'
                      }`}
                    >
                      <span>{DROPDOWN_MENUS.training.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          openDropdown === 'training' ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    <AnimatePresence>
                      {openDropdown === 'training' && (
                        <motion.div
                          role="menu"
                          aria-label="Training menu"
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[290px] z-50"
                        >
                          <div className="rounded-[22px] border border-[#E5E5E5] dark:border-[#343436] bg-white/96 dark:bg-[#1E1E1F]/96 backdrop-blur-xl p-2 shadow-[0_18px_48px_rgba(0,0,0,0.1)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.48)]">
                            {DROPDOWN_MENUS.training.items.map((item) => {
                              const active = isItemActive(item.pages);
                              return (
                                <button
                                  key={item.path}
                                  type="button"
                                  role="menuitem"
                                  onClick={() => handleNavClick(item.path)}
                                  className={`w-full text-left rounded-[14px] px-3.5 py-2.5 transition-colors cursor-pointer ${
                                    active
                                      ? 'bg-[#5E67E6]/10 dark:bg-[#D0FF71]/15'
                                      : 'hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2D]'
                                  }`}
                                >
                                  <span
                                    className={`block text-[14px] leading-snug ${
                                      active
                                        ? 'font-semibold text-[#5E67E6] dark:text-[#D0FF71]'
                                        : 'font-medium text-[#303030] dark:text-white'
                                    }`}
                                  >
                                    {item.label}
                                  </span>
                                  <span className="mt-0.5 block text-[12px] font-light text-[#5C5C5C] dark:text-white/65 leading-snug">
                                    {item.description}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <RollingNavLink
                    label="IT Services"
                    active={route.page === 'it-services'}
                    onClick={() => handleNavClick('/it-services')}
                  />

                  {/* Sub-Dropdown 2: Resources */}
                  <div
                    className="relative"
                    onMouseEnter={() => openDropdownByHover('resources')}
                    onMouseLeave={() =>
                      setOpenDropdown((prev) => (prev === 'resources' ? null : prev))
                    }
                  >
                    <button
                      type="button"
                      aria-expanded={openDropdown === 'resources'}
                      aria-haspopup="menu"
                      onClick={() => toggleDropdownByClick('resources')}
                      className={`inline-flex items-center gap-1 h-6 px-0.5 text-[15px] leading-6 cursor-pointer whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71] rounded ${
                        isDropdownActive('resources') || openDropdown === 'resources'
                          ? 'text-[#5E67E6] dark:text-[#D0FF71] font-medium'
                          : 'text-[#303030] dark:text-white/90 font-light hover:text-[#5E67E6] dark:hover:text-[#D0FF71]'
                      }`}
                    >
                      <span>{DROPDOWN_MENUS.resources.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          openDropdown === 'resources' ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    <AnimatePresence>
                      {openDropdown === 'resources' && (
                        <motion.div
                          role="menu"
                          aria-label="Resources menu"
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[300px] z-50"
                        >
                          <div className="rounded-[22px] border border-[#E5E5E5] dark:border-[#343436] bg-white/96 dark:bg-[#1E1E1F]/96 backdrop-blur-xl p-2 shadow-[0_18px_48px_rgba(0,0,0,0.1)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.48)]">
                            {DROPDOWN_MENUS.resources.items.map((item) => {
                              const active = isItemActive(item.pages);
                              return (
                                <button
                                  key={item.path}
                                  type="button"
                                  role="menuitem"
                                  onClick={() => handleNavClick(item.path)}
                                  className={`w-full text-left rounded-[14px] px-3.5 py-2.5 transition-colors cursor-pointer ${
                                    active
                                      ? 'bg-[#5E67E6]/10 dark:bg-[#D0FF71]/15'
                                      : 'hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2D]'
                                  }`}
                                >
                                  <span
                                    className={`block text-[14px] leading-snug ${
                                      active
                                        ? 'font-semibold text-[#5E67E6] dark:text-[#D0FF71]'
                                        : 'font-medium text-[#303030] dark:text-white'
                                    }`}
                                  >
                                    {item.label}
                                  </span>
                                  <span className="mt-0.5 block text-[12px] font-light text-[#5C5C5C] dark:text-white/65 leading-snug">
                                    {item.description}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Action Buttons: Contact & Explore Training */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenDropdown(null);
                      onContactClick();
                    }}
                    className="rounded-full border border-[#303030]/20 dark:border-white/25 bg-transparent px-4 py-2 text-[14px] font-normal text-[#303030] dark:text-white transition-colors duration-200 hover:border-[#303030] hover:bg-[#303030] hover:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-[#1A1A1B] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
                  >
                    Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/upcoming-training')}
                    className="rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-5 py-2 text-[14px] font-medium text-white dark:text-[#1A1A1B] transition-colors duration-200 hover:bg-[#303030] dark:hover:bg-white cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
                  >
                    Explore Training
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </header>

      {/* Mobile & Tablet Floating Pill Navbar + Expanding Frosted Card (< lg) */}
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
                    <button
                      type="button"
                      onClick={() => handleNavClick('/')}
                      className={`w-full text-center text-[17px] transition-colors py-2 min-h-[44px] rounded-[14px] cursor-pointer ${
                        route.page === 'home'
                          ? 'text-[#5E67E6] dark:text-[#D0FF71] font-medium bg-[#5E67E6]/8 dark:bg-[#D0FF71]/10'
                          : 'text-[#303030] dark:text-white/90 font-light hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2D]'
                      }`}
                    >
                      Home
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('/about')}
                      className={`w-full text-center text-[17px] transition-colors py-2 min-h-[44px] rounded-[14px] cursor-pointer ${
                        route.page === 'about'
                          ? 'text-[#5E67E6] dark:text-[#D0FF71] font-medium bg-[#5E67E6]/8 dark:bg-[#D0FF71]/10'
                          : 'text-[#303030] dark:text-white/90 font-light hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2D]'
                      }`}
                    >
                      About Us
                    </button>

                    {/* Mobile Sub-Dropdown 1: Training */}
                    <div className="w-full">
                      <button
                        type="button"
                        aria-expanded={mobileDropdown === 'training'}
                        onClick={() =>
                          setMobileDropdown((prev) => (prev === 'training' ? null : 'training'))
                        }
                        className={`w-full flex items-center justify-center gap-1.5 text-[17px] py-2 min-h-[44px] rounded-[14px] cursor-pointer transition-colors ${
                          isDropdownActive('training') || mobileDropdown === 'training'
                            ? 'text-[#5E67E6] dark:text-[#D0FF71] font-medium'
                            : 'text-[#303030] dark:text-white/90 font-light'
                        }`}
                      >
                        <span>Training</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            mobileDropdown === 'training' ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {mobileDropdown === 'training' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="my-1 rounded-[16px] bg-[#F5F5F5] dark:bg-[#2A2A2C] p-1.5 flex flex-col gap-1">
                              {DROPDOWN_MENUS.training.items.map((item) => (
                                <button
                                  key={item.path}
                                  type="button"
                                  onClick={() => handleNavClick(item.path)}
                                  className={`w-full text-center py-2.5 px-3 rounded-[12px] text-[15px] min-h-[44px] cursor-pointer transition-colors ${
                                    isItemActive(item.pages)
                                      ? 'bg-white dark:bg-[#1E1E1F] text-[#5E67E6] dark:text-[#D0FF71] font-medium'
                                      : 'text-[#303030] dark:text-white/85 font-light hover:bg-white/70 dark:hover:bg-[#1E1E1F]/60'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNavClick('/it-services')}
                      className={`w-full text-center text-[17px] transition-colors py-2 min-h-[44px] rounded-[14px] cursor-pointer ${
                        route.page === 'it-services'
                          ? 'text-[#5E67E6] dark:text-[#D0FF71] font-medium bg-[#5E67E6]/8 dark:bg-[#D0FF71]/10'
                          : 'text-[#303030] dark:text-white/90 font-light hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2D]'
                      }`}
                    >
                      IT Services
                    </button>

                    {/* Mobile Sub-Dropdown 2: Resources */}
                    <div className="w-full">
                      <button
                        type="button"
                        aria-expanded={mobileDropdown === 'resources'}
                        onClick={() =>
                          setMobileDropdown((prev) => (prev === 'resources' ? null : 'resources'))
                        }
                        className={`w-full flex items-center justify-center gap-1.5 text-[17px] py-2 min-h-[44px] rounded-[14px] cursor-pointer transition-colors ${
                          isDropdownActive('resources') || mobileDropdown === 'resources'
                            ? 'text-[#5E67E6] dark:text-[#D0FF71] font-medium'
                            : 'text-[#303030] dark:text-white/90 font-light'
                        }`}
                      >
                        <span>Resources</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            mobileDropdown === 'resources' ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {mobileDropdown === 'resources' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="my-1 rounded-[16px] bg-[#F5F5F5] dark:bg-[#2A2A2C] p-1.5 flex flex-col gap-1">
                              {DROPDOWN_MENUS.resources.items.map((item) => (
                                <button
                                  key={item.path}
                                  type="button"
                                  onClick={() => handleNavClick(item.path)}
                                  className={`w-full text-center py-2.5 px-3 rounded-[12px] text-[15px] min-h-[44px] cursor-pointer transition-colors ${
                                    isItemActive(item.pages)
                                      ? 'bg-white dark:bg-[#1E1E1F] text-[#5E67E6] dark:text-[#D0FF71] font-medium'
                                      : 'text-[#303030] dark:text-white/85 font-light hover:bg-white/70 dark:hover:bg-[#1E1E1F]/60'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Mobile CTA Buttons: Contact & Explore Training */}
                    <div className="mt-3 pt-3 border-t border-[#E5E5E5] dark:border-[#343436] grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileDropdown(null);
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
