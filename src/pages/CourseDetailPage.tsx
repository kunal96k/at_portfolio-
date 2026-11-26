import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Award, BookOpen, CheckCircle2, ChevronRight, Clock, HelpCircle, MapPin, User } from 'lucide-react';
import { getCourseBySlug, TRAINING_COURSES } from '../data/coursesData';
import { SafeImage } from '../components/SafeImage';

interface CourseDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onContactClick?: () => void;
}

export function CourseDetailPage({ slug, onNavigate, onContactClick }: CourseDetailPageProps) {
  const course = getCourseBySlug(slug) ?? TRAINING_COURSES[0];
  const relatedCourses = TRAINING_COURSES.filter((c) => c.slug !== course.slug).slice(0, 3);

  const handleEnquire = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      onNavigate('/contact');
    }
  };

  return (
    <main id="main-content" className="relative z-10 px-5 sm:px-8 pt-28 sm:pt-36 pb-20">
      <article className="mx-auto max-w-[1120px]">
        {/* Breadcrumb Navigation */}
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
          <a
            href="/upcoming-batches"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/upcoming-batches');
            }}
            className="hover:text-[#4F58DF] dark:hover:text-[#D0FF71] transition-colors"
          >
            Upcoming Batches
          </a>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" aria-hidden="true" />
          <span className="text-[#303030] dark:text-white font-semibold truncate max-w-[240px] sm:max-w-none">
            {course.shortTitle}
          </span>
        </nav>

        {/* Hero Header */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center rounded-full bg-[#4F58DF]/10 dark:bg-[#D0FF71]/15 px-3.5 py-1 text-[13px] font-semibold text-[#4F58DF] dark:text-[#D0FF71]">
              {course.badge}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E5] dark:border-[#333335] px-3 py-1 text-[12.5px] font-normal text-[#5C5C5C] dark:text-white/70">
              <MapPin className="w-3.5 h-3.5 text-[#4F58DF] dark:text-[#D0FF71]" aria-hidden="true" />
              <span>Nashik, Maharashtra &amp; Live Online</span>
            </span>
          </div>

          <h1 className="mt-5 font-display text-[38px] sm:text-[56px] lg:text-[68px] font-bold leading-[1.05] tracking-[-0.02em] uppercase text-[#303030] dark:text-white">
            {course.title}
          </h1>

          <p className="mt-5 text-[17px] sm:text-[19px] font-light leading-[1.65] text-[#474747] dark:text-white/85 max-w-[880px]">
            {course.summary}
          </p>

          {/* Key Course Specifications Row */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-y border-[#E5E5E5] dark:border-[#333335] py-5">
            <div>
              <p className="flex items-center gap-1.5 text-[12.5px] font-medium uppercase tracking-wider text-[#5C5C5C] dark:text-white/60">
                <Award className="w-3.5 h-3.5 text-[#4F58DF] dark:text-[#D0FF71]" aria-hidden="true" />
                <span>Certification</span>
              </p>
              <p className="mt-1 text-[14.5px] font-semibold text-[#303030] dark:text-white">
                {course.certification}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[12.5px] font-medium uppercase tracking-wider text-[#5C5C5C] dark:text-white/60">
                <Clock className="w-3.5 h-3.5 text-[#4F58DF] dark:text-[#D0FF71]" aria-hidden="true" />
                <span>Batch Slots</span>
              </p>
              <p className="mt-1 text-[14.5px] font-semibold text-[#303030] dark:text-white">
                Weekday &amp; Weekend
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[12.5px] font-medium uppercase tracking-wider text-[#5C5C5C] dark:text-white/60">
                <User className="w-3.5 h-3.5 text-[#4F58DF] dark:text-[#D0FF71]" aria-hidden="true" />
                <span>Trainer</span>
              </p>
              <p className="mt-1 text-[14.5px] font-semibold text-[#303030] dark:text-white">
                Arvind Thevar (15+ Yrs)
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[12.5px] font-medium uppercase tracking-wider text-[#5C5C5C] dark:text-white/60">
                <BookOpen className="w-3.5 h-3.5 text-[#4F58DF] dark:text-[#D0FF71]" aria-hidden="true" />
                <span>Format</span>
              </p>
              <p className="mt-1 text-[14.5px] font-semibold text-[#303030] dark:text-white">
                100% Practical Labs
              </p>
            </div>
          </div>

          {/* Action Call to Action */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              onClick={handleEnquire}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4F58DF] dark:bg-[#D0FF71] px-7 py-3.5 text-[15px] font-semibold text-white dark:text-[#1A1A1B] transition-transform active:scale-98 hover:opacity-90 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F58DF]"
            >
              <span>Enquire for Next Batch</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <a
              href="/resources"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/resources');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#303030]/25 dark:border-white/25 px-6 py-3.5 text-[15px] font-medium text-[#303030] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2A2A2C] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F58DF]"
            >
              <span>Preview Lab Notes &amp; Resources</span>
            </a>
          </div>
        </motion.header>

        {/* Target Audience Section */}
        <section className="mt-16 sm:mt-20 border-t border-[#E5E5E5] dark:border-[#333335] pt-12">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4F58DF] dark:bg-[#D0FF71]" />
            <h2 className="font-display text-[24px] sm:text-[30px] font-bold uppercase tracking-tight text-[#303030] dark:text-white">
              Who This Course Is For
            </h2>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {course.targetAudience.map((audience, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl border border-[#E5E5E5] dark:border-[#343436] bg-[#FAFAFC] dark:bg-[#1E1E20] p-4 sm:p-5"
              >
                <CheckCircle2 className="w-5 h-5 text-[#4F58DF] dark:text-[#D0FF71] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-[15px] leading-relaxed text-[#303030] dark:text-white/85">
                  {audience}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Curriculum & Learning Outcomes */}
        <section className="mt-16 sm:mt-20 border-t border-[#E5E5E5] dark:border-[#333335] pt-12">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4F58DF] dark:bg-[#D0FF71]" />
            <h2 className="font-display text-[24px] sm:text-[30px] font-bold uppercase tracking-tight text-[#303030] dark:text-white">
              Syllabus &amp; Exam Objectives
            </h2>
          </div>
          <p className="mt-2 text-[15px] text-[#5C5C5C] dark:text-white/70 max-w-[760px]">
            Structured step-by-step syllabus aligned with official performance-based certification blueprints and enterprise job requirements.
          </p>

          <div className="mt-8 space-y-5">
            {course.learningOutcomes.map((module) => (
              <div
                key={module.moduleNumber}
                className="rounded-[22px] border border-[#E5E5E5] dark:border-[#343436] bg-white dark:bg-[#1C1C1D] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 pb-4 border-b border-[#F0F0F2] dark:border-[#2C2C2E]">
                  <span className="font-mono text-[14px] font-bold text-[#4F58DF] dark:text-[#D0FF71]">
                    MODULE {module.moduleNumber}
                  </span>
                  <h3 className="text-[19px] sm:text-[21px] font-bold text-[#303030] dark:text-white">
                    {module.moduleTitle}
                  </h3>
                </div>
                <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {module.topics.map((topic, tidx) => (
                    <li key={tidx} className="flex items-start gap-2.5 text-[14.5px] leading-relaxed text-[#474747] dark:text-white/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#4F58DF] dark:bg-[#D0FF71] shrink-0 mt-2" aria-hidden="true" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Practical Hands-On Lab Highlights */}
        <section className="mt-16 sm:mt-20 border-t border-[#E5E5E5] dark:border-[#333335] pt-12">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4F58DF] dark:bg-[#D0FF71]" />
            <h2 className="font-display text-[24px] sm:text-[30px] font-bold uppercase tracking-tight text-[#303030] dark:text-white">
              The "Build It. Break It. Fix It." Lab Approach
            </h2>
          </div>
          <p className="mt-2 text-[15px] text-[#5C5C5C] dark:text-white/70 max-w-[760px]">
            Theory alone does not survive production outages. In our labs, students configure the topology, watch the instructor inject realistic faults, and diagnose the root cause calmly.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {course.labHighlights.map((highlight, hidx) => (
              <div
                key={hidx}
                className="rounded-2xl border border-[#E5E5E5] dark:border-[#343436] bg-[#FAFAFC] dark:bg-[#1E1E20] p-5 flex items-start gap-3.5"
              >
                <div className="h-8 w-8 rounded-full bg-[#4F58DF]/10 dark:bg-[#D0FF71]/15 flex items-center justify-center shrink-0 text-[#4F58DF] dark:text-[#D0FF71] font-bold text-[13px]">
                  {hidx + 1}
                </div>
                <p className="text-[14.5px] leading-relaxed text-[#303030] dark:text-white/85 font-medium">
                  {highlight}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Course FAQ Section */}
        {course.faq.length > 0 && (
          <section className="mt-16 sm:mt-20 border-t border-[#E5E5E5] dark:border-[#333335] pt-12">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4F58DF] dark:bg-[#D0FF71]" />
              <h2 className="font-display text-[24px] sm:text-[30px] font-bold uppercase tracking-tight text-[#303030] dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mt-6 space-y-4">
              {course.faq.map((item, fidx) => (
                <div
                  key={fidx}
                  className="rounded-2xl border border-[#E5E5E5] dark:border-[#343436] bg-white dark:bg-[#1E1E20] p-6"
                >
                  <h3 className="text-[16.5px] font-bold text-[#303030] dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#4F58DF] dark:text-[#D0FF71] shrink-0" aria-hidden="true" />
                    <span>{item.question}</span>
                  </h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#5C5C5C] dark:text-white/75 pl-6">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Training Courses */}
        <section className="mt-16 sm:mt-20 border-t border-[#E5E5E5] dark:border-[#333335] pt-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4F58DF] dark:bg-[#D0FF71]" />
              <h2 className="font-display text-[24px] sm:text-[30px] font-bold uppercase tracking-tight text-[#303030] dark:text-white">
                Related Training Tracks
              </h2>
            </div>
            <a
              href="/upcoming-batches"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/upcoming-batches');
              }}
              className="text-[14px] font-medium text-[#4F58DF] dark:text-[#D0FF71] hover:underline"
            >
              View All Schedules &rarr;
            </a>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedCourses.map((rel) => (
              <a
                key={rel.slug}
                href={`/training/${rel.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(`/training/${rel.slug}`);
                }}
                className="group block rounded-2xl border border-[#E5E5E5] dark:border-[#343436] bg-white dark:bg-[#1C1C1D] p-5 transition-all hover:border-[#4F58DF] dark:hover:border-[#D0FF71] hover:-translate-y-0.5"
              >
                <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[#4F58DF] dark:text-[#D0FF71]">
                  {rel.badge}
                </span>
                <h3 className="mt-2 text-[17px] font-bold text-[#303030] dark:text-white group-hover:text-[#4F58DF] dark:group-hover:text-[#D0FF71] transition-colors leading-snug">
                  {rel.shortTitle}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#5C5C5C] dark:text-white/70 line-clamp-2">
                  {rel.summary}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[#4F58DF] dark:text-[#D0FF71]">
                  <span>Explore Course</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Bottom Consultation Banner */}
        <div className="mt-16 rounded-[28px] bg-[#4F58DF] dark:bg-[#D0FF71] p-8 sm:p-10 text-white dark:text-[#1A1A1B] flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-md">
          <div className="max-w-[620px]">
            <h2 className="font-display text-[26px] sm:text-[32px] font-bold uppercase leading-tight">
              Ready to Upgrade Your Hands-On IT Skills?
            </h2>
            <p className="mt-2 text-[15px] opacity-90 leading-relaxed">
              Contact Arvind Thevar directly to check upcoming batch start dates, syllabus questions, or custom institutional lab tracks in Nashik.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleEnquire}
              className="rounded-full bg-white dark:bg-[#1A1A1B] text-[#303030] dark:text-white px-6 py-3 text-[14.5px] font-semibold transition-opacity hover:opacity-90 cursor-pointer"
            >
              Book Batch Consultation
            </button>
            <a
              href="https://wa.me/918888829652"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/60 dark:border-[#1A1A1B]/40 px-5 py-3 text-[14.5px] font-medium hover:bg-white/10 dark:hover:bg-[#1A1A1B]/10 transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}
