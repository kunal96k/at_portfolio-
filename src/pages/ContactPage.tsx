import { motion } from 'motion/react';
import { Mail, MapPin, Phone, MessageCircle, Clock, ChevronRight } from 'lucide-react';
import { PROFILE } from '../data/portfolioData';
import { ContactSection } from '../components/ContactSection';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  return (
    <main id="main-content" className="relative z-10 px-5 sm:px-8 pt-28 sm:pt-36 pb-20">
      <div className="mx-auto max-w-[1120px]">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[13.5px] font-medium text-[#5C5C5C] dark:text-white/60">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="hover:text-[#4F58DF] dark:hover:text-[#D0FF71] transition-colors"
          >
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" aria-hidden="true" />
          <span className="text-[#303030] dark:text-white font-semibold">
            Contact
          </span>
        </nav>

        {/* Hero Header */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[840px]"
        >
          <span className="inline-flex items-center rounded-full bg-[#4F58DF]/10 dark:bg-[#D0FF71]/15 px-3.5 py-1 text-[13px] font-semibold text-[#4F58DF] dark:text-[#D0FF71]">
            Direct Consultation &amp; Batch Admissions
          </span>
          <h1 className="mt-4 font-display text-[42px] sm:text-[58px] lg:text-[68px] font-bold leading-[1.05] tracking-[-0.02em] uppercase text-[#303030] dark:text-white">
            Get In Touch With Arvind Thevar
          </h1>
          <p className="mt-4 text-[17px] sm:text-[19px] font-light leading-[1.65] text-[#474747] dark:text-white/80">
            Have questions about upcoming Red Hat Linux, Cisco CCNA/CCNP, or AWS batches? Looking to discuss institutional training or corporate upskilling in Nashik? Connect directly via phone, WhatsApp, or email.
          </p>
        </motion.header>

        {/* Contact Info Cards Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="tel:+918888829652"
            className="group rounded-2xl border border-[#E5E5E5] dark:border-[#343436] bg-[#FAFAFC] dark:bg-[#1E1E20] p-5 transition-all hover:border-[#4F58DF] dark:hover:border-[#D0FF71]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F58DF]/10 dark:bg-[#D0FF71]/15 text-[#4F58DF] dark:text-[#D0FF71]">
              <Phone className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-[12.5px] font-semibold uppercase tracking-wider text-[#5C5C5C] dark:text-white/60">
              Call Direct
            </p>
            <p className="mt-1 text-[15px] font-bold text-[#303030] dark:text-white group-hover:text-[#4F58DF] dark:group-hover:text-[#D0FF71] transition-colors">
              +91 88888 29652
            </p>
            <p className="mt-1 text-[12px] text-[#71717A] dark:text-white/60">
              Mon – Sat: 9:00 AM – 7:00 PM IST
            </p>
          </a>

          <a
            href="https://wa.me/918888829652"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-[#E5E5E5] dark:border-[#343436] bg-[#FAFAFC] dark:bg-[#1E1E20] p-5 transition-all hover:border-[#0BDE66]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0BDE66]/10 text-[#0BDE66]">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-[12.5px] font-semibold uppercase tracking-wider text-[#5C5C5C] dark:text-white/60">
              WhatsApp
            </p>
            <p className="mt-1 text-[15px] font-bold text-[#303030] dark:text-white group-hover:text-[#0BDE66] transition-colors">
              Chat on WhatsApp
            </p>
            <p className="mt-1 text-[12px] text-[#71717A] dark:text-white/60">
              Fastest response for batch schedules
            </p>
          </a>

          <a
            href={`mailto:${PROFILE.email}`}
            className="group rounded-2xl border border-[#E5E5E5] dark:border-[#343436] bg-[#FAFAFC] dark:bg-[#1E1E20] p-5 transition-all hover:border-[#4F58DF] dark:hover:border-[#D0FF71]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F58DF]/10 dark:bg-[#D0FF71]/15 text-[#4F58DF] dark:text-[#D0FF71]">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-[12.5px] font-semibold uppercase tracking-wider text-[#5C5C5C] dark:text-white/60">
              Email
            </p>
            <p className="mt-1 text-[15px] font-bold text-[#303030] dark:text-white truncate group-hover:text-[#4F58DF] dark:group-hover:text-[#D0FF71] transition-colors">
              {PROFILE.email}
            </p>
            <p className="mt-1 text-[12px] text-[#71717A] dark:text-white/60">
              For corporate RFPs and syllabus PDFs
            </p>
          </a>

          <div className="rounded-2xl border border-[#E5E5E5] dark:border-[#343436] bg-[#FAFAFC] dark:bg-[#1E1E20] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F58DF]/10 dark:bg-[#D0FF71]/15 text-[#4F58DF] dark:text-[#D0FF71]">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-[12.5px] font-semibold uppercase tracking-wider text-[#5C5C5C] dark:text-white/60">
              Training Center
            </p>
            <p className="mt-1 text-[13.5px] font-semibold text-[#303030] dark:text-white leading-snug">
              College Road, near BYK College
            </p>
            <p className="mt-1 text-[12px] text-[#71717A] dark:text-white/60">
              Nashik, Maharashtra 422005
            </p>
          </div>
        </div>

        {/* Embedded Contact Section Form with Honeypot */}
        <div className="mt-12">
          <ContactSection />
        </div>
      </div>
    </main>
  );
}
