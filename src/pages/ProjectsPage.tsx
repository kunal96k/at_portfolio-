import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { PROJECTS, type ProjectItem } from '../data/portfolioData';
import { FeaturedProjectsSection } from '../components/FeaturedProjectsSection';
import { PublicDetailModal } from '../components/PublicDetailModal';
import { SafeImage } from '../components/SafeImage';
import { TruncatedTextWithMore } from '../components/TruncatedTextWithMore';

interface ProjectsPageProps {
  onNavigate: (path: string) => void;
}

export function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const moreProjects = PROJECTS.filter((p) => !p.featured);
  const [selectedTrack, setSelectedTrack] = useState<ProjectItem | null>(null);

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
                <motion.article
                  key={project.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.55, delay: idx * 0.06 }}
                  className="group flex h-full flex-col rounded-[20px]"
                >
                  <a
                    href={`/projects/${project.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/projects/${project.slug}`);
                    }}
                    className="block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
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
                      <h3 className="mt-3 font-display text-[28px] sm:text-[32px] font-bold uppercase leading-[1.2] text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors line-clamp-2">
                        {project.title}
                      </h3>
                    </div>
                  </a>
                  <div className="mt-2">
                    <TruncatedTextWithMore
                      lines={3}
                      text={project.shortDescription}
                      className="text-[15px] sm:text-[16px] font-light leading-[1.6] text-[#303030] dark:text-white/75"
                      ariaLabel={`Read more about ${project.title}`}
                      onMore={() => setSelectedTrack(project)}
                    />
                  </div>
                </motion.article>
              ))}
            </div>

            <PublicDetailModal
              open={Boolean(selectedTrack)}
              onClose={() => setSelectedTrack(null)}
              titleId="project-track-modal-title"
              closeLabel="Close track details"
              maxWidthClass="max-w-[680px]"
            >
              {selectedTrack && (
                <div>
                  <div className="aspect-[16/9] w-full overflow-hidden bg-[#141415]">
                    <SafeImage
                      src={selectedTrack.coverImage}
                      alt={selectedTrack.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6 sm:p-8">
                    <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-3.5 py-0.5 text-[12.5px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                      {selectedTrack.category}
                    </span>
                    <h3
                      id="project-track-modal-title"
                      className="mt-3 font-display text-[28px] sm:text-[32px] font-bold uppercase leading-[1.15] text-[#303030] dark:text-white"
                    >
                      {selectedTrack.title}
                    </h3>
                    <p className="mt-3 whitespace-pre-line text-[15.5px] font-light leading-[1.65] text-[#303030] dark:text-white/80">
                      {selectedTrack.shortDescription}
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          const slug = selectedTrack.slug;
                          setSelectedTrack(null);
                          onNavigate(`/projects/${slug}`);
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-6 py-2.5 text-[14px] font-semibold text-white dark:text-[#1A1A1B] hover:opacity-90 cursor-pointer"
                      >
                        <span>Explore Track</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </PublicDetailModal>
          </div>
        </section>
      )}
    </main>
  );
}
