import { motion } from 'motion/react';
import { PROJECTS } from '../data/portfolioData';
import { FeaturedProjectsSection } from '../components/FeaturedProjectsSection';
import { SafeImage } from '../components/SafeImage';

interface ProjectsPageProps {
  onNavigate: (path: string) => void;
}

export function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const moreProjects = PROJECTS.filter((p) => !p.featured);

  return (
    <main className="relative z-10 pt-20 sm:pt-24 pb-16">
      <FeaturedProjectsSection
        onNavigate={onNavigate}
        showBrowseButton={false}
        asMainHeading
      />

      {/* More Tracks Grid (if additional non-featured items exist) */}
      {moreProjects.length > 0 && (
        <section aria-label="More Training Tracks" className="px-5 sm:px-8 py-12 sm:py-20">
          <div className="mx-auto max-w-[1120px]">
            <h2 className="font-display text-[44px] sm:text-[56px] font-bold uppercase text-[#303030] dark:text-white">
              MORE TRACKS
            </h2>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              {moreProjects.map((project, idx) => (
                <motion.a
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/projects/${project.slug}`);
                  }}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.55, delay: idx * 0.06 }}
                  className="group block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
                >
                  <div className="overflow-hidden rounded-[20px] aspect-[16/10] bg-[#ECECEE] dark:bg-[#2C2C2D]">
                    <SafeImage
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                  </div>

                  <div className="mt-5">
                    <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-3.5 py-0.5 text-[13px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
                      {project.category}
                    </span>
                    <h3 className="mt-3 font-display text-[28px] sm:text-[32px] font-bold uppercase leading-[1.2] text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-[15px] sm:text-[16px] font-light leading-[1.6] text-[#303030] dark:text-white/75 line-clamp-3">
                      {project.shortDescription}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
