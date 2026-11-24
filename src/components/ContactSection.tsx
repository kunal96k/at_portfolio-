import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import { ASSETS, PROFILE } from '../data/portfolioData';
import {
  validateContactForm,
  type ContactFormErrors,
  type ContactFormValues,
} from '../utils/scrollMath';
import { HiBadge } from './HiBadge';
import { useResponsiveReveal } from '../hooks/useResponsiveReveal';
import { OutlineButton } from './OutlineButton';
import { SafeImage } from './SafeImage';

const SERVICE_OPTIONS = [
  'Red Hat Linux (RHEL / RHCSA & RHCE)',
  'Cisco CCNA / CCNP Training',
  'AWS Solutions Architect / Cloud Computing',
  'Windows Server, Security & Virtualization',
  'Corporate / Institutional Training',
  'Free Career Consultation',
];

export function ContactSection() {
  const [values, setValues] = useState<ContactFormValues>({
    name: '',
    email: '',
    service: '',
    message: '',
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const reveal = useResponsiveReveal(0.2, 0.65);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateContactForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setSubmitted(true);
    }
  };

  const resetForm = () => {
    setValues({ name: '', email: '', service: '', message: '' });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <section
      id="contact"
      aria-label="Book a Free Consultation or Contact Arvind Thevar"
      className="relative z-10 w-full px-5 sm:px-8 pt-16 pb-24 sm:py-28 scroll-mt-24"
    >
      <div className="mx-auto max-w-[1120px] grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr] gap-12 lg:gap-16 items-center">
        {/* Left Portrait + Floating Waving Hand / Hi Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={reveal.viewport}
          transition={{ duration: reveal.duration, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center lg:justify-start"
        >
          <div className="relative w-[260px] sm:w-[320px] lg:w-[340px] aspect-[340/476]">
            <div className="w-full h-full rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] bg-[#D9D9D7]">
              <SafeImage
                src={ASSETS.portraitFront}
                alt="Arvind Thevar portrait"
                className="w-full h-full object-cover object-[40%_18%] scale-[1.08]"
              />
            </div>
            <div className="absolute -left-8 sm:-left-12 -bottom-6">
              <HiBadge size="lg" initialMode="wave" />
            </div>
          </div>
        </motion.div>

        {/* Right Form Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={reveal.viewport}
          transition={{
            duration: reveal.duration,
            delay: reveal.isCompactViewport ? 0 : 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="w-full"
        >
          <h2 className="font-display text-[44px] sm:text-[56px] lg:text-[60px] font-bold leading-[1.12] uppercase text-[#303030] dark:text-white">
            BOOK A FREE CONSULTATION
          </h2>
          <p className="mt-3 text-[16px] sm:text-[18px] font-light leading-[1.55] text-[#303030] dark:text-white/80 max-w-[540px]">
            Looking to join an upcoming Linux, Cisco CCNA/CCNP or AWS batch, or plan corporate
            training for your IT team? Reach out directly or send a message below.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] sm:text-[15px]">
            <a
              href={PROFILE.phoneHref}
              className="font-medium text-[#5E67E6] dark:text-[#D0FF71] hover:underline tabular-nums"
            >
              Call / WhatsApp: {PROFILE.phone}
            </a>
            <a
              href={`mailto:${PROFILE.email}`}
              className="font-medium text-[#5E67E6] dark:text-[#D0FF71] hover:underline"
            >
              Email: {PROFILE.email}
            </a>
          </div>

          {submitted ? (
            <div
              role="status"
              className="mt-8 rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-7 sm:p-8 border border-[#5E67E6]/30 dark:border-[#D0FF71]/35"
            >
              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-[#5E67E6] dark:text-[#D0FF71] mt-0.5" />
                <div>
                  <h3 className="font-display text-[28px] font-bold uppercase text-[#303030] dark:text-white">
                    INQUIRY RECEIVED!
                  </h3>
                  <p className="mt-2 text-[16px] font-light leading-[1.6] text-[#303030] dark:text-white/80">
                    Thank you, {values.name}. Your inquiry about{' '}
                    <span className="font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                      {values.service}
                    </span>{' '}
                    has been noted. You can also connect directly on WhatsApp at {PROFILE.phone} or{' '}
                    {PROFILE.email}.
                  </p>
                  <div className="mt-6">
                    <OutlineButton onClick={resetForm}>SEND ANOTHER</OutlineButton>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              {/* Row 1: Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-[14px] font-light text-[#5E67E6] dark:text-[#D0FF71] mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={values.name}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, name: e.target.value }));
                      if (errors.name) setErrors((err) => ({ ...err, name: undefined }));
                    }}
                    placeholder="Your full name"
                    className="w-full rounded-full bg-[#F5F5F5] dark:bg-[#333335] px-5 py-3.5 text-[15px] font-light text-[#303030] dark:text-white placeholder:text-[#9A9A9A] dark:placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#5E67E6] dark:focus:ring-[#D0FF71] transition-shadow"
                  />
                  {errors.name && (
                    <p className="mt-1.5 pl-2 text-[13px] text-[#E53935] dark:text-[#FF7B7B]">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-[14px] font-light text-[#5E67E6] dark:text-[#D0FF71] mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={values.email}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, email: e.target.value }));
                      if (errors.email) setErrors((err) => ({ ...err, email: undefined }));
                    }}
                    placeholder="you@example.com"
                    className="w-full rounded-full bg-[#F5F5F5] dark:bg-[#333335] px-5 py-3.5 text-[15px] font-light text-[#303030] dark:text-white placeholder:text-[#9A9A9A] dark:placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#5E67E6] dark:focus:ring-[#D0FF71] transition-shadow"
                  />
                  {errors.email && (
                    <p className="mt-1.5 pl-2 text-[13px] text-[#E53935] dark:text-[#FF7B7B]">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Training / Service Needed */}
              <div>
                <label
                  htmlFor="contact-service"
                  className="block text-[14px] font-light text-[#5E67E6] dark:text-[#D0FF71] mb-2"
                >
                  Training / Service Needed
                </label>
                <div className="relative">
                  <select
                    id="contact-service"
                    value={values.service}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, service: e.target.value }));
                      if (errors.service) setErrors((err) => ({ ...err, service: undefined }));
                    }}
                    className={`w-full appearance-none rounded-full bg-[#F5F5F5] dark:bg-[#333335] px-5 py-3.5 pr-11 text-[15px] font-light focus:outline-none focus:ring-2 focus:ring-[#5E67E6] dark:focus:ring-[#D0FF71] transition-shadow cursor-pointer ${
                      values.service
                        ? 'text-[#303030] dark:text-white'
                        : 'text-[#9A9A9A] dark:text-white/45'
                    }`}
                  >
                    <option value="" disabled>
                      Select a course or service…
                    </option>
                    {SERVICE_OPTIONS.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        className="bg-white dark:bg-[#2C2C2D] text-[#303030] dark:text-white"
                      >
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C5C5C] dark:text-white/60"
                    aria-hidden="true"
                  />
                </div>
                {errors.service && (
                  <p className="mt-1.5 pl-2 text-[13px] text-[#E53935] dark:text-[#FF7B7B]">
                    {errors.service}
                  </p>
                )}
              </div>

              {/* Row 3: Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-[14px] font-light text-[#5E67E6] dark:text-[#D0FF71] mb-2"
                >
                  How Can I Help You?
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={values.message}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, message: e.target.value }));
                    if (errors.message) setErrors((err) => ({ ...err, message: undefined }));
                  }}
                  placeholder="Share your background, target certification (RHEL, CCNA, CCNP, AWS), or team training requirements..."
                  className="w-full rounded-[22px] bg-[#F5F5F5] dark:bg-[#333335] px-5 py-4 text-[15px] font-light text-[#303030] dark:text-white placeholder:text-[#9A9A9A] dark:placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#5E67E6] dark:focus:ring-[#D0FF71] transition-shadow resize-y"
                />
                {errors.message && (
                  <p className="mt-1.5 pl-2 text-[13px] text-[#E53935] dark:text-[#FF7B7B]">
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <OutlineButton type="submit">SUBMIT</OutlineButton>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
