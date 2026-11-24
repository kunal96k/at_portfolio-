import { ArrowLeft, BookOpen, Home, Mail } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <main id="main-content" className="relative z-10 flex min-h-[72vh] items-center justify-center px-5 sm:px-8 pt-32 pb-20">
      <div className="mx-auto max-w-[620px] text-center">
        <span className="inline-flex items-center rounded-full bg-[#4F58DF]/10 dark:bg-[#D0FF71]/15 px-4 py-1 text-[13px] font-bold text-[#4F58DF] dark:text-[#D0FF71] tracking-wider uppercase">
          404 Error
        </span>

        <h1 className="mt-4 font-display text-[46px] sm:text-[64px] font-bold uppercase leading-none tracking-tight text-[#303030] dark:text-white">
          Page Not Found
        </h1>

        <p className="mt-4 text-[16px] sm:text-[17.5px] leading-relaxed text-[#5C5C5C] dark:text-white/80">
          The page you are looking for may have been moved, renamed, or is temporarily unavailable. Explore our core hands-on training tracks or return home.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#4F58DF] dark:bg-[#D0FF71] px-6 py-3 text-[14.5px] font-semibold text-white dark:text-[#1A1A1B] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Return to Home</span>
          </a>
          <a
            href="/upcoming-training"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/upcoming-training');
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[#303030]/25 dark:border-white/25 px-6 py-3 text-[14.5px] font-medium text-[#303030] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2A2A2C] transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>View Training Batches</span>
          </a>
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/contact');
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[#303030]/25 dark:border-white/25 px-5 py-3 text-[14.5px] font-medium text-[#303030] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2A2A2C] transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>Contact Us</span>
          </a>
        </div>
      </div>
    </main>
  );
}
