import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, ChevronUp } from 'lucide-react';
import { SERVICES } from '../data/portfolioData';

interface ServicesAccordionProps {
  defaultOpenId?: string | null;
}

export function ServicesAccordion({ defaultOpenId = null }: ServicesAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full">
      {SERVICES.map((service) => {
        const isOpen = openId === service.id;
        return (
          <div
            key={service.id}
            className={`border-b transition-colors duration-300 ${
              isOpen
                ? 'border-[#5E67E6] dark:border-[#D0FF71]'
                : 'border-[#E5E5E5] dark:border-[#333335]'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(service.id)}
              aria-expanded={isOpen}
              className="w-full py-5 sm:py-6 flex items-center justify-between gap-4 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71] rounded"
            >
              <h3
                className={`font-display text-[26px] sm:text-[32px] font-normal leading-[1.25] uppercase transition-colors duration-250 ${
                  isOpen
                    ? 'text-[#5E67E6] dark:text-[#D0FF71]'
                    : 'text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71]'
                }`}
              >
                {service.number} {service.title}
              </h3>

              <span
                aria-hidden="true"
                className={`shrink-0 transition-transform duration-300 ${
                  isOpen
                    ? 'rotate-180 text-[#5E67E6] dark:text-[#D0FF71]'
                    : 'rotate-0 text-[#303030] dark:text-white/80'
                }`}
              >
                <ChevronUp className="w-5 h-5" strokeWidth={1.75} />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <ul className="pb-6 pt-1 space-y-3.5">
                    {service.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[16px] sm:text-[18px] font-light leading-[1.5] text-[#303030] dark:text-white/85"
                      >
                        <CheckCircle2
                          className="w-[18px] h-[18px] mt-1 shrink-0 text-[#5E67E6] dark:text-[#D0FF71]"
                          strokeWidth={1.6}
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
