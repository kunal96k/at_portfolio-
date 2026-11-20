import { motion } from 'motion/react';
import { ASSETS, CORPORATE_PARTNERS, EXPERTISE_DOMAINS } from '../data/portfolioData';
import { ContactSection } from '../components/ContactSection';
import { OutlineButton } from '../components/OutlineButton';
import { SafeImage } from '../components/SafeImage';
import { ServicesAccordion } from '../components/ServicesAccordion';

interface ItServicesPageProps {
  onNavigate: (path: string) => void;
}

export function ItServicesPage({ onNavigate }: ItServicesPageProps) {
  return (
    <main className="relative z-10">
      {/* Header + Core Infrastructure Services Accordion */}
      <section className="px-5 sm:px-8 pt-32 sm:pt-40 pb-16 sm:pb-24">
        <div className="mx-auto max-w-[1120px] grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-display text-[56px] sm:text-[84px] lg:text-[104px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white">
              IT SERVICES &amp; EXPERTISE
            </h1>
            <p className="mt-5 mb-10 text-[16px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[540px]">
              15+ years of hands-on experience in server deployments, enterprise network design,
              system administration, performance tuning, live troubleshooting and corporate IT
              training.
            </p>
            <ServicesAccordion />
            <div className="mt-9 flex flex-wrap gap-3">
              <OutlineButton onClick={() => onNavigate('/upcoming-training')}>
                EXPLORE UPCOMING BATCHES
              </OutlineButton>
              <OutlineButton onClick={() => onNavigate('/projects')}>VIEW LAB TRACKS</OutlineButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center lg:justify-end lg:sticky lg:top-28"
          >
            <div className="w-full max-w-[400px] aspect-[340/460] rounded-[22px] overflow-hidden shadow-[0_22px_54px_rgba(0,0,0,0.08)] dark:shadow-[0_22px_54px_rgba(0,0,0,0.45)] bg-[#E5E5E7] dark:bg-[#2C2C2D]">
              <SafeImage
                src={ASSETS.portraitBackWorkspace}
                alt="IT infrastructure and training lab environment"
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* All 10 Core Domains */}
      <section className="px-5 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="font-display text-[40px] sm:text-[52px] font-bold leading-[1.12] uppercase text-[#303030] dark:text-white">
            TEN CORE INFRASTRUCTURE DOMAINS
          </h2>
          <p className="mt-2 text-[17px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
            Ten core domains. One goal: job-ready skills.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            {EXPERTISE_DOMAINS.map((domain, idx) => (
              <motion.div
                key={domain.number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: idx * 0.03 }}
                className="rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-6 sm:p-7 flex items-start gap-4"
              >
                <span className="font-display text-[34px] font-bold leading-none text-[#5E67E6] dark:text-[#D0FF71]">
                  {domain.number}
                </span>
                <div>
                  <h3 className="font-display text-[24px] font-bold uppercase text-[#303030] dark:text-white">
                    {domain.title}
                  </h3>
                  <p className="mt-2 text-[15px] font-light leading-[1.6] text-[#303030] dark:text-white/80">
                    {domain.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Corporate Delivery Summary */}
          <div className="mt-16 pt-12 border-t border-[#E5E5E5] dark:border-[#333335]">
            <h2 className="font-display text-[36px] sm:text-[46px] font-bold uppercase text-[#303030] dark:text-white">
              ORGANISATIONS &amp; INSTITUTIONS TRAINED
            </h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CORPORATE_PARTNERS.map((partner) => (
                <div
                  key={partner.organization}
                  className="rounded-[18px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-5"
                >
                  <h3 className="font-display text-[20px] font-bold uppercase text-[#303030] dark:text-white">
                    {partner.organization}
                  </h3>
                  <p className="mt-1.5 text-[14px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
                    {partner.program}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
