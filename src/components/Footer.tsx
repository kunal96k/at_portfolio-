import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { ASSETS, PROFILE } from '../data/portfolioData';
import { SafeImage } from './SafeImage';
import { SocialIcon } from './SocialIcons';

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
  { label: 'Blogs', path: '/blogs' },
  { label: 'Gallery', path: '/gallery' },
];

const CORE_TRACKS = [
  { label: 'Red Hat Linux (RHEL)', path: '/upcoming-training' },
  { label: 'Cisco CCNA & CCNP', path: '/upcoming-training' },
  { label: 'AWS Solutions Architect', path: '/upcoming-training' },
  { label: 'Windows Server & Virtualization', path: '/upcoming-training' },
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
    <footer className="relative z-10 w-full bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] transition-colors duration-300">
      <div className="mx-auto max-w-[1160px] px-5 sm:px-8 pt-14 sm:pt-16 pb-24 sm:pb-20">
        {/* Top Brand & CTA Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pb-10 border-b border-white/25 dark:border-[#1A1A1B]/20">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <span className="inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full overflow-hidden bg-[#1A1A1B]/90 ring-2 ring-white/35 dark:ring-[#1A1A1B]/25 shrink-0">
              <SafeImage
                src={ASSETS.creatorLogo}
                alt="Arvind Thevar Logo"
                className="w-full h-full object-cover object-[36%_18%] scale-[1.18]"
              />
            </span>
            <div>
              <p className="font-display text-[28px] sm:text-[34px] font-bold leading-none uppercase tracking-tight">
                {PROFILE.name}
              </p>
              <p className="mt-1.5 text-[14px] sm:text-[15px] font-medium opacity-90">
                {PROFILE.roleTitle} · 15+ Years
              </p>
              <p className="mt-1 text-[13.5px] font-light opacity-80">{PROFILE.heroTagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleNav('/upcoming-training')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white dark:bg-[#1A1A1B] text-[#303030] dark:text-white px-6 py-3 text-[14px] font-semibold hover:opacity-90 transition-opacity cursor-pointer min-h-[44px]"
            >
              <span>Explore Training</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => (onContactClick ? onContactClick() : handleNav('/'))}
              className="inline-flex items-center justify-center rounded-full border border-white/50 dark:border-[#1A1A1B]/40 px-6 py-3 text-[14px] font-medium hover:bg-white/15 dark:hover:bg-[#1A1A1B]/10 transition-colors cursor-pointer min-h-[44px]"
            >
              Book Consultation
            </button>
          </div>
        </div>

        {/* Main 3-Column Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 py-10 sm:py-12">
          {/* Column 1: Navigation */}
          <div>
            <h2 className="font-display text-[19px] font-bold uppercase tracking-wide">
              Navigation
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[14.5px] font-light">
              {QUICK_LINKS.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav(item.path);
                    }}
                    className="inline-block opacity-90 hover:opacity-100 hover:translate-x-0.5 transition-all"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Training Tracks */}
          <div>
            <h2 className="font-display text-[19px] font-bold uppercase tracking-wide">
              Training Tracks
            </h2>
            <ul className="mt-4 space-y-2.5 text-[14.5px] font-light">
              {CORE_TRACKS.map((track) => (
                <li key={track.label}>
                  <a
                    href={track.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav(track.path);
                    }}
                    className="inline-block opacity-90 hover:opacity-100 hover:translate-x-0.5 transition-all"
                  >
                    {track.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Direct Contact & Social Channels */}
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h2 className="font-display text-[19px] font-bold uppercase tracking-wide">
                Direct Contact
              </h2>

              <div className="space-y-3">
                <a href={PROFILE.phoneHref} className="flex items-start gap-3 group">
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 dark:bg-[#1A1A1B]/12 shrink-0 group-hover:bg-white/25 dark:group-hover:bg-[#1A1A1B]/20 transition-colors">
                    <Phone className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[12px] uppercase tracking-wider opacity-75">
                      Call / WhatsApp
                    </p>
                    <p className="text-[15.5px] font-semibold tabular-nums group-hover:opacity-85 transition-opacity">
                      {PROFILE.phone}
                    </p>
                  </div>
                </a>

                <a href={`mailto:${PROFILE.email}`} className="flex items-start gap-3 group">
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 dark:bg-[#1A1A1B]/12 shrink-0 group-hover:bg-white/25 dark:group-hover:bg-[#1A1A1B]/20 transition-colors">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] uppercase tracking-wider opacity-75">Email</p>
                    <p className="text-[15px] font-semibold break-all group-hover:opacity-85 transition-opacity">
                      {PROFILE.email}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            <div>
              <p className="text-[12px] uppercase tracking-wider opacity-75 mb-3">Connect</p>
              <div className="flex items-center gap-2.5">
                {PROFILE.socials.map((social) => (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 dark:bg-[#1A1A1B]/12 hover:bg-white/25 dark:hover:bg-[#1A1A1B]/20 hover:-translate-y-0.5 transition-all"
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

        {/* Bottom Copyright & Developed By Strip */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6 text-[13.5px] font-light">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 opacity-90">
            <p>© Copyright 2026 {PROFILE.name}. All Rights Reserved.</p>
            <span className="hidden sm:inline opacity-40">·</span>
            <p className="opacity-80">IT Trainer &amp; IT Infrastructure Professional</p>
          </div>

          <a
            href="https://www.technokraftservices.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Developed by TechnoKraft Services LLP (opens in a new tab)"
            className="group inline-flex items-center gap-2 self-start md:self-auto rounded-full border border-white/30 dark:border-[#1A1A1B]/25 bg-white/12 dark:bg-[#1A1A1B]/12 hover:bg-white/22 dark:hover:bg-[#1A1A1B]/20 px-3.5 py-1.5 backdrop-blur-md transition-colors duration-200 shadow-sm"
          >
            <span className="text-[12px] font-medium uppercase tracking-wider opacity-80">
              Developed by
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-[13px] text-white dark:text-[#1A1A1B] underline-offset-4 group-hover:underline">
              TechnoKraft Services LLP
              <ArrowUpRight className="w-3.5 h-3.5 opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
