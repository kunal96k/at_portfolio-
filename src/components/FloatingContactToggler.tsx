import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Mail, MessageCircle, Phone, X } from 'lucide-react';
import { PROFILE } from '../data/portfolioData';

interface FloatingContactTogglerProps {
  onContactClick: () => void;
}

export function FloatingContactToggler({ onContactClick }: FloatingContactTogglerProps) {
  const [visibleOnScroll, setVisibleOnScroll] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 220;
      setVisibleOnScroll(scrolled);
      if (!scrolled) {
        setIsOpen(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const whatsappHref = `https://wa.me/91${PROFILE.whatsappNumber}`;

  return (
    <AnimatePresence>
      {(visibleOnScroll || isOpen) && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 24, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-30 flex flex-col items-end"
        >
          {/* Expanded Contact Us Popover Card */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                role="dialog"
                aria-label="Contact Us"
                initial={{ opacity: 0, y: 16, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                style={{ transformOrigin: 'bottom right' }}
                className="mb-3.5 w-[296px] sm:w-[320px] rounded-[22px] bg-white dark:bg-[#232325] text-[#303030] dark:text-white shadow-[0_24px_60px_rgba(0,0,0,0.16)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)] border border-black/[0.08] dark:border-white/[0.1] overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-[#F7F8FC] dark:bg-[#2C2C2F] border-b border-black/[0.06] dark:border-white/[0.08]">
                  <p className="text-[16px] font-semibold tracking-tight text-[#303030] dark:text-white">
                    Contact Us
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close contact menu"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#5C5C5C] dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Contact Options */}
                <div className="p-3 space-y-1.5">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3.5 rounded-[14px] px-3 py-2.5 hover:bg-[#5E67E6]/[0.07] dark:hover:bg-[#D0FF71]/[0.1] transition-colors group"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#5E67E6]/10 dark:bg-[#D0FF71]/15 text-[#5E67E6] dark:text-[#D0FF71] shrink-0 group-hover:scale-105 transition-transform">
                      <MessageCircle className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14.5px] font-semibold text-[#303030] dark:text-white leading-tight">
                        WhatsApp
                      </p>
                      <p className="mt-0.5 text-[13px] font-light text-[#5C5C5C] dark:text-white/70 tabular-nums">
                        {PROFILE.phone}
                      </p>
                    </div>
                  </a>

                  <a
                    href={PROFILE.phoneHref}
                    className="flex items-center gap-3.5 rounded-[14px] px-3 py-2.5 hover:bg-[#5E67E6]/[0.07] dark:hover:bg-[#D0FF71]/[0.1] transition-colors group"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#5E67E6]/10 dark:bg-[#D0FF71]/15 text-[#5E67E6] dark:text-[#D0FF71] shrink-0 group-hover:scale-105 transition-transform">
                      <Phone className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14.5px] font-semibold text-[#303030] dark:text-white leading-tight">
                        Call
                      </p>
                      <p className="mt-0.5 text-[13px] font-light text-[#5C5C5C] dark:text-white/70 tabular-nums">
                        {PROFILE.phone}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${PROFILE.email}`}
                    className="flex items-center gap-3.5 rounded-[14px] px-3 py-2.5 hover:bg-[#5E67E6]/[0.07] dark:hover:bg-[#D0FF71]/[0.1] transition-colors group"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#5E67E6]/10 dark:bg-[#D0FF71]/15 text-[#5E67E6] dark:text-[#D0FF71] shrink-0 group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14.5px] font-semibold text-[#303030] dark:text-white leading-tight">
                        Email
                      </p>
                      <p className="mt-0.5 text-[13px] font-light text-[#5C5C5C] dark:text-white/70 truncate">
                        {PROFILE.email}
                      </p>
                    </div>
                  </a>
                </div>

                {/* Footer Action: Send an inquiry form */}
                <div className="border-t border-black/[0.06] dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onContactClick();
                    }}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-[14.5px] font-semibold text-[#5E67E6] dark:text-[#D0FF71] hover:bg-[#5E67E6]/[0.06] dark:hover:bg-[#D0FF71]/[0.08] transition-colors cursor-pointer"
                  >
                    <span>Send an inquiry form</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Circular Floating Trigger Button */}
          <motion.button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close quick contact menu' : 'Open quick contact menu'}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] shadow-[0_14px_34px_rgba(94,103,230,0.42)] dark:shadow-[0_14px_34px_rgba(208,255,113,0.3)] ring-2 ring-white/80 dark:ring-[#1A1A1B]/80 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5E67E6]/40 dark:focus-visible:ring-[#D0FF71]/40"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </motion.span>
              ) : (
                <motion.span
                  key="chat"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  <MessageCircle className="w-6 h-6" aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
