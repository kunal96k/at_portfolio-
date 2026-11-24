import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { ASSETS, PROFILE } from '../data/portfolioData';
import { SafeImage } from './SafeImage';
import { SocialIcon } from './SocialIcons';
import { trackEmailClick, trackPhoneClick, trackSocialClick } from '../utils/analytics';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onContactClick?: () => void;
}

const QUICK_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Upcoming Training', path: '/upcoming-training' },
  { label: 'Notes & Resources', path: '/resources' },
  { label: 'Student Testimonials', path: '/testimonials' },
  { label: 'Blogs & Guides', path: '/blogs' },
  { label: 'Lab Gallery', path: '/gallery' },
  { label: 'Contact & Admissions', path: '/contact' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
];

const CORE_TRACKS = [
  { label: 'Red Hat Linux (RHEL)', path: '/training/rhel-linux' },
  { label: 'Cisco CCNA & CCNP', path: '/training/cisco-ccna-ccnp' },
  { label: 'AWS Solutions Architect', path: '/training/aws-solutions-architect' },
  { label: 'Windows Server & AD', path: '/training/windows-server' },
  { label: 'Virtualization & Labs', path: '/training/virtualization-cloud' },
];

export function Footer({ onNavigate, onContactClick }: FooterProps) {
  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return (
    <footer className="relative z-10 w-full bg-[#4F58DF] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] transition-colors duration-300">
      <div className="mx-auto max-w-[1160px] px-5 sm:px-8 pt-14 sm:pt-16 pb-24 sm:pb-20">
        {/* Top Brand & CTA Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pb-10 border-b border-white/25 dark:border-[#1A1A1B]/20">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <span className="inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full overflow-hidden bg-[#1A1A1B]/90 ring-2 ring-white/40 dark:ring-[#1A1A1B]/25 shrink-0">
              <SafeImage
                src={ASSETS.creatorLogo}
                alt="Arvind Thevar Logo"
                variant="avatar"
                className="w-full h-full object-cover object-[36%_18%] scale-[1.18]"
              />
            </span>
            <div>
              <p className="font-display text-[28px] sm:text-[34px] font-bold leading-none uppercase tracking-tight">
                {PROFILE.name}
              </p>
              <p className="mt-1.5 text-[14px] sm:text-[15px] font-medium text-white/95 dark:text-[#1A1A1B]/95">
                {PROFILE.roleTitle} · 15+ Years
              </p>
              <p className="mt-1 text-[13.5px] font-normal text-white/90 dark:text-[#1A1A1B]/85">
                {PROFILE.heroTagline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/upcoming-training"
              onClick={(e) => {
                e.preventDefault();
                handleNav('/upcoming-training');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white dark:bg-[#1A1A1B] text-[#303030] dark:text-white px-6 py-3 text-[14px] font-semibold hover:opacity-90 transition-opacity cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white dark:focus-visible:ring-[#1A1A1B]"
            >
              <span>Explore Training</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => (onContactClick ? onContactClick() : handleNav('/'))}
              className="inline-flex items-center justify-center rounded-full border border-white/60 dark:border-[#1A1A1B]/45 px-6 py-3 text-[14px] font-medium hover:bg-white/15 dark:hover:bg-[#1A1A1B]/10 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white dark:focus-visible:ring-[#1A1A1B]"
            >
              Book Consultation
            </button>
          </div>
        </div>

        {/* Main 3-Column Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 py-10 sm:py-12">
          {/* Column 1: Navigation */}
          <nav aria-label="Footer navigation">
            <h2 className="font-display text-[19px] font-bold uppercase tracking-wide">
              Navigation
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[14.5px] font-normal">
              {QUICK_LINKS.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav(item.path);
                    }}
                    className="inline-block py-0.5 text-white/95 dark:text-[#1A1A1B]/95 hover:underline underline-offset-4 hover:translate-x-0.5 transition-all"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 2: Training Tracks */}
          <nav aria-label="Core training tracks">
            <h2 className="font-display text-[19px] font-bold uppercase tracking-wide">
              Training Tracks
            </h2>
            <ul className="mt-4 space-y-2.5 text-[14.5px] font-normal">
              {CORE_TRACKS.map((track) => (
                <li key={track.label}>
                  <a
                    href={track.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav(track.path);
                    }}
                    className="inline-block py-0.5 text-white/95 dark:text-[#1A1A1B]/95 hover:underline underline-offset-4 hover:translate-x-0.5 transition-all"
                  >
                    {track.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Direct Contact & Social Channels */}
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h2 className="font-display text-[19px] font-bold uppercase tracking-wide">
                Direct Contact
              </h2>

              <div className="space-y-3">
                <a
                  href={PROFILE.phoneHref}
                  onClick={() => trackPhoneClick(PROFILE.phone)}
                  className="flex items-start gap-3 group"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/18 dark:bg-[#1A1A1B]/12 shrink-0 group-hover:bg-white/25 dark:group-hover:bg-[#1A1A1B]/20 transition-colors">
                    <Phone className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-wider text-white/95 dark:text-[#1A1A1B]/90">
                      Call / WhatsApp
                    </p>
                    <p className="text-[15.5px] font-semibold tabular-nums group-hover:underline underline-offset-4">
                      {PROFILE.phone}
                    </p>
                  </div>
                </a>

                <a
                  href={`mailto:${PROFILE.email}`}
                  onClick={() => trackEmailClick(PROFILE.email)}
                  className="flex items-start gap-3 group"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/18 dark:bg-[#1A1A1B]/12 shrink-0 group-hover:bg-white/25 dark:group-hover:bg-[#1A1A1B]/20 transition-colors">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium uppercase tracking-wider text-white/95 dark:text-[#1A1A1B]/90">
                      Email
                    </p>
                    <p className="text-[15px] font-semibold break-all group-hover:underline underline-offset-4">
                      {PROFILE.email}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider text-white/95 dark:text-[#1A1A1B]/90 mb-3">
                Connect
              </p>
              <div className="flex items-center gap-2.5">
                {PROFILE.socials.map((social) => (
                  <a
                    key={social.id}
                    href={social.href}
                    onClick={() => trackSocialClick(social.label, social.href)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label} (opens in a new tab)`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/18 dark:bg-[#1A1A1B]/12 hover:bg-white/28 dark:hover:bg-[#1A1A1B]/20 hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white dark:focus-visible:ring-[#1A1A1B]"
                  >
                    <SocialIcon id={social.id} className="w-[18px] h-[18px]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hairline Divider */}
        <div className="h-px w-full bg-white/30 dark:bg-[#1A1A1B]/20" />

        {/* Bottom Copyright, Temporary Admin Preview Buttons & Developed By Strip */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6 text-[13.5px] font-normal">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-white/95 dark:text-[#1A1A1B]/95">
            <p>© Copyright 2026 {PROFILE.name}. All Rights Reserved.</p>
            <span className="hidden sm:inline opacity-60" aria-hidden="true">·</span>
            <p>IT Trainer &amp; IT Infrastructure Professional</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/admin-dashboard/?view=login"
              rel="nofollow"
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-white/45 dark:border-[#1A1A1B]/35 bg-white/15 dark:bg-[#1A1A1B]/12 hover:bg-white/25 dark:hover:bg-[#1A1A1B]/20 px-3.5 py-1.5 text-[12.5px] font-medium text-white dark:text-[#1A1A1B] transition-colors duration-200"
            >
              <span>Admin Login</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <a
              href="/admin-dashboard/"
              rel="nofollow"
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-white/45 dark:border-[#1A1A1B]/35 bg-white/15 dark:bg-[#1A1A1B]/12 hover:bg-white/25 dark:hover:bg-[#1A1A1B]/20 px-3.5 py-1.5 text-[12.5px] font-medium text-white dark:text-[#1A1A1B] transition-colors duration-200"
            >
              <span>Admin Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <a
              href="https://www.technokraftservices.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Developed by TechnoKraft Services LLP (opens in a new tab)"
              className="group inline-flex min-h-[38px] items-center gap-2 rounded-full border border-white/40 dark:border-[#1A1A1B]/30 bg-white/15 dark:bg-[#1A1A1B]/12 hover:bg-white/25 dark:hover:bg-[#1A1A1B]/20 px-3.5 py-1.5 backdrop-blur-md transition-colors duration-200 shadow-sm"
            >
              <span className="text-[12px] font-medium uppercase tracking-wider text-white/95 dark:text-[#1A1A1B]/90">
                Developed by
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-[13px] text-white dark:text-[#1A1A1B] underline-offset-4 group-hover:underline">
                TechnoKraft Services LLP
                <ArrowUpRight
                  className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                  aria-hidden="true"
                />
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
