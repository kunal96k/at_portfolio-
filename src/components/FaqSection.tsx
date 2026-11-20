import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import { FAQS } from '../data/portfolioData';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section
      aria-label="Frequently Asked Questions"
      className="relative z-10 w-full px-5 sm:px-8 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-[1120px] grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-10 lg:gap-16 items-start">
        {/* Left Sticky Heading Column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:sticky lg:top-32"
        >
          <h2 className="font-display text-[44px] sm:text-[56px] lg:text-[60px] font-bold leading-[1.12] uppercase text-[#303030] dark:text-white">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="mt-4 text-[16px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[400px]">
            Answers to common questions about courses, live lab methodology, certification
            preparation, and corporate training.
          </p>
        </motion.div>

        {/* Right Interactive FAQ Accordion */}
        <div className="w-full">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.number}
                className={`border-b transition-colors duration-300 ${
                  isOpen
                    ? 'border-[#5E67E6] dark:border-[#D0FF71]'
                    : 'border-[#E5E5E5] dark:border-[#333335]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full py-6 flex items-start justify-between gap-4 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71] rounded"
                >
                  <div className="flex items-baseline gap-2.5">
                    <span
                      className={`font-display text-[22px] sm:text-[26px] font-normal leading-[1.25] uppercase shrink-0 transition-colors duration-250 ${
                        isOpen
                          ? 'text-[#5E67E6] dark:text-[#D0FF71]'
                          : 'text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71]'
                      }`}
                    >
                      {faq.number}
                    </span>
                    <h4
                      className={`font-display text-[22px] sm:text-[26px] font-normal leading-[1.25] uppercase transition-colors duration-250 ${
                        isOpen
                          ? 'text-[#5E67E6] dark:text-[#D0FF71]'
                          : 'text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71]'
                      }`}
                    >
                      {faq.question}
                    </h4>
                  </div>

                  <span
                    aria-hidden="true"
                    className={`mt-1.5 shrink-0 transition-transform duration-300 ${
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
                      <p className="pb-6 pr-6 text-[16px] sm:text-[17px] font-light leading-[1.65] text-[#303030] dark:text-white/85">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
