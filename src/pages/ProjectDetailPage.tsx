import { useState } from 'react';
import { motion } from 'motion/react';
import { PROJECTS } from '../data/portfolioData';
import { OutlineButton } from '../components/OutlineButton';
import { SafeImage } from '../components/SafeImage';

interface ProjectDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export function ProjectDetailPage({ slug, onNavigate }: ProjectDetailPageProps) {
  const project = PROJECTS.find((p) => p.slug === slug) ?? PROJECTS[0];
  const otherProjects = PROJECTS.filter((p) => p.slug !== project.slug);
  const [visibleCount, setVisibleCount] = useState(2);

  return (
    <main className="relative z-10 px-5 sm:px-8 pt-32 sm:pt-40 pb-20">
      <article className="mx-auto max-w-[1120px]">
        {/* Header Metadata matching ref-project-detail.png */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-4 py-1 text-[14px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
            {project.category}
          </span>

          <h1 className="mt-5 font-display text-[52px] sm:text-[78px] lg:text-[96px] font-bold leading-[1.03] tracking-[-0.02em] uppercase text-[#303030] dark:text-white max-w-[960px]">
            {project.title}
          </h1>

          <p className="mt-5 text-[17px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[760px]">
            {project.shortDescription}
          </p>

          {/* 4-Column Metadata Row */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 border-y border-[#E5E5E5] dark:border-[#333335] py-6">
            <div>
              <p className="text-[14px] font-light text-[#5C5C5C] dark:text-white/65">Year :</p>
              <p className="mt-1 text-[17px] font-medium text-[#5E67E6] dark:text-[#D0FF71] tabular-nums">
                {project.year}
              </p>
            </div>
            <div>
              <p className="text-[14px] font-light text-[#5C5C5C] dark:text-white/65">Industry :</p>
              <p className="mt-1 text-[17px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                {project.industry}
              </p>
            </div>
            <div>
              <p className="text-[14px] font-light text-[#5C5C5C] dark:text-white/65">Client :</p>
              <p className="mt-1 text-[17px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                {project.client}
              </p>
            </div>
            <div>
              <p className="text-[14px] font-light text-[#5C5C5C] dark:text-white/65">
                Project Duration :
              </p>
              <p className="mt-1 text-[17px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                {project.duration}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hero Cover Image */}
        <div className="mt-12 overflow-hidden rounded-[22px] sm:rounded-[28px] aspect-[16/10] bg-[#161618]">
          <SafeImage
            src={project.coverImage}
            alt={project.title}
            loading="eager"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Case Study Narrative Sections */}
        <div className="mt-16 space-y-14 max-w-[820px]">
          <div>
            <h2 className="font-display text-[36px] sm:text-[44px] font-bold uppercase text-[#303030] dark:text-white">
              PROBLEM :
            </h2>
            <div className="mt-4 space-y-4 text-[17px] font-light leading-[1.7] text-[#303030] dark:text-white/80">
              {project.problem.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {project.galleryImages[0] && (
            <div className="overflow-hidden rounded-[20px] aspect-[16/10] bg-[#ECECEE] dark:bg-[#2C2C2D]">
              <SafeImage
                src={project.galleryImages[0]}
                alt={`${project.title} visual exploration 1`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <h2 className="font-display text-[36px] sm:text-[44px] font-bold uppercase text-[#303030] dark:text-white">
              SOLUTION :
            </h2>
            <div className="mt-4 space-y-4 text-[17px] font-light leading-[1.7] text-[#303030] dark:text-white/80">
              {project.solution.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {project.galleryImages.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {project.galleryImages.slice(1, 3).map((img, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-[20px] aspect-[4/3] bg-[#ECECEE] dark:bg-[#2C2C2D]"
                >
                  <SafeImage
                    src={img}
                    alt={`${project.title} gallery detail ${i + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <h2 className="font-display text-[36px] sm:text-[44px] font-bold uppercase text-[#303030] dark:text-white">
              CHALLENGE :
            </h2>
            <div className="mt-4 space-y-4 text-[17px] font-light leading-[1.7] text-[#303030] dark:text-white/80">
              {project.challenge.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-[36px] sm:text-[44px] font-bold uppercase text-[#303030] dark:text-white">
              SUMMARY :
            </h2>
            <div className="mt-4 space-y-4 text-[17px] font-light leading-[1.7] text-[#303030] dark:text-white/80">
              {project.summary.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>

        {/* More Projects */}
        <section className="mt-24 pt-16 border-t border-[#E5E5E5] dark:border-[#333335]">
          <h2 className="font-display text-[40px] sm:text-[52px] font-bold uppercase text-[#303030] dark:text-white">
            MORE PROJECTS
          </h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {otherProjects.slice(0, visibleCount).map((item) => (
              <a
                key={item.slug}
                href={`/projects/${item.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(`/projects/${item.slug}`);
                }}
                className="group block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
              >
                <div className="overflow-hidden rounded-[20px] aspect-[16/10] bg-[#ECECEE] dark:bg-[#2C2C2D]">
                  <SafeImage
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-3.5 py-0.5 text-[13px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
                    {item.category}
                  </span>
                  <h3 className="mt-3 font-display text-[28px] font-bold uppercase text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[15px] font-light leading-[1.6] text-[#303030] dark:text-white/75 line-clamp-2">
                    {item.shortDescription}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {visibleCount < otherProjects.length && (
            <div className="mt-12 flex justify-center">
              <OutlineButton
                onClick={() => setVisibleCount((c) => Math.min(c + 2, otherProjects.length))}
              >
                LOAD MORE
              </OutlineButton>
            </div>
          )}
        </section>
      </article>
    </main>
  );
}
