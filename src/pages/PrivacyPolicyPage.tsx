import { ChevronRight } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate: (path: string) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  return (
    <main id="main-content" className="relative z-10 px-5 sm:px-8 pt-28 sm:pt-36 pb-20">
      <article className="mx-auto max-w-[860px]">
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
            Privacy Policy
          </span>
        </nav>

        <header>
          <div className="inline-flex items-center rounded-full bg-[#4F58DF]/10 dark:bg-[#D0FF71]/15 px-3.5 py-1 text-[12.5px] font-semibold text-[#4F58DF] dark:text-[#D0FF71]">
            Legal &amp; Data Transparency
          </div>
          <h1 className="mt-4 font-display text-[38px] sm:text-[48px] font-bold uppercase tracking-tight text-[#303030] dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-2 text-[14px] text-[#5C5C5C] dark:text-white/60">
            Last Updated: November 2026 · [TODO(owner): Review and customize this policy for your registered business entity]
          </p>
        </header>

        <div className="mt-10 space-y-8 text-[15.5px] leading-[1.75] text-[#3A3A3C] dark:text-white/85">
          <section>
            <h2 className="text-[20px] font-bold text-[#303030] dark:text-white">
              1. Overview
            </h2>
            <p className="mt-2">
              This Privacy Policy explains how Arvind Thevar ("we", "us", or "our") collects, uses, and safeguards personal information submitted through this website (<a href="https://arvindthevar.vercel.app/" className="text-[#4F58DF] dark:text-[#D0FF71] underline">https://arvindthevar.vercel.app/</a>). We respect your privacy and are committed to handling your data ethically and responsibly.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#303030] dark:text-white">
              2. Information We Collect
            </h2>
            <p className="mt-2">
              When you submit a course inquiry, consultation request, or message through our contact form, we may collect:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Your name</li>
              <li>Your email address</li>
              <li>Your telephone / mobile contact number</li>
              <li>Course or domain of interest (e.g. Red Hat Linux, Cisco CCNA, AWS Cloud)</li>
              <li>Any message content or training questions you provide</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#303030] dark:text-white">
              3. How We Use Your Information
            </h2>
            <p className="mt-2">
              The information you provide is used solely to:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Respond directly to your training inquiries and send syllabus / batch schedules</li>
              <li>Coordinate batch timings, lab access, and enrollment details</li>
              <li>Improve our website, lab materials, and student support services</li>
            </ul>
            <p className="mt-2 font-medium">
              We do not sell, rent, or trade your personal information to third-party marketers.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#303030] dark:text-white">
              4. Cookies and Web Analytics
            </h2>
            <p className="mt-2">
              This website may use privacy-preserving web analytics (such as Google Analytics 4) to understand aggregate website usage (e.g., page views, session duration, and device types). These analytics tools collect anonymized IP addresses and technical metrics to help us optimize page loading speed and user experience.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#303030] dark:text-white">
              5. Third-Party Links &amp; External Services
            </h2>
            <p className="mt-2">
              Our website may contain links to external sites (such as LinkedIn, GitHub, YouTube, or WhatsApp). We are not responsible for the privacy practices or content of third-party platforms. We encourage you to review their respective privacy policies when visiting external sites.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#303030] dark:text-white">
              6. Contact Information
            </h2>
            <p className="mt-2">
              If you have any questions regarding this Privacy Policy or wish to request deletion of your inquiry details, please contact:
            </p>
            <div className="mt-3 rounded-2xl border border-[#E5E5E5] dark:border-[#343436] bg-[#FAFAFC] dark:bg-[#1E1E20] p-5 space-y-1 text-[14.5px]">
              <p><strong className="text-[#303030] dark:text-white">Arvind Thevar</strong></p>
              <p>Email: <a href="mailto:arvindthaver@gmail.com" className="text-[#4F58DF] dark:text-[#D0FF71]">arvindthaver@gmail.com</a></p>
              <p>Phone: <a href="tel:+918888829652" className="text-[#4F58DF] dark:text-[#D0FF71]">+91 88888 29652</a></p>
              <p>Address: Office No-2, First Floor, Kanchawala Avenue, College Rd, near BYK College, Nashik, Maharashtra 422005</p>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
