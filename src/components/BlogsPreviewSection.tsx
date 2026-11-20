import { motion } from 'motion/react';
import { BLOGS } from '../data/portfolioData';
import { OutlineButton } from './OutlineButton';
import { SafeImage } from './SafeImage';

interface BlogsPreviewSectionProps {
  onNavigate: (path: string) => void;
}

export function BlogsPreviewSection({ onNavigate }: BlogsPreviewSectionProps) {
  const previewPosts = BLOGS.slice(0, 2);

  return (
    <section
      aria-label="Infrastructure Insights and Study Guides"
      className="relative z-10 w-full px-5 sm:px-8 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-[1120px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[580px]"
        >
          <h2 className="font-display text-[44px] sm:text-[56px] lg:text-[60px] font-bold leading-[1.15] uppercase text-[#303030] dark:text-white">
            INFRASTRUCTURE INSIGHTS &amp; GUIDES
          </h2>
          <p className="mt-4 text-[16px] sm:text-[18px] font-light leading-[1.55] text-[#303030] dark:text-white/80">
            Practical guides on Linux administration, Cisco networking, cloud migration and live
            troubleshooting methodology.
          </p>
        </motion.div>

        {/* 2-Column Blog Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {previewPosts.map((post, idx) => (
            <motion.a
              key={post.slug}
              href={`/blogs/${post.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`/blogs/${post.slug}`);
              }}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71] rounded-[20px]"
            >
              <div className="overflow-hidden rounded-[20px] aspect-[16/10] bg-[#ECECEE] dark:bg-[#2C2C2D]">
                <SafeImage
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </div>

              <div className="mt-5 flex items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-3.5 py-0.5 text-[13px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
                  {post.category}
                </span>
                <span className="text-[14px] font-light text-[#5C5C5C] dark:text-white/70">
                  {post.date}
                </span>
              </div>

              <h3 className="mt-3.5 font-display text-[28px] sm:text-[32px] font-bold uppercase leading-[1.2] text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors">
                {post.title}
              </h3>

              <p className="mt-2.5 text-[15px] sm:text-[16px] font-light leading-[1.6] text-[#303030] dark:text-white/75">
                {post.excerpt}
              </p>
            </motion.a>
          ))}
        </div>

        <div className="mt-12 sm:mt-14 flex flex-wrap justify-center gap-4">
          <OutlineButton onClick={() => onNavigate('/blogs')}>BROWSE ALL GUIDES</OutlineButton>
          <OutlineButton onClick={() => onNavigate('/resources')}>
            NOTES &amp; LAB SECTIONS
          </OutlineButton>
        </div>
      </div>
    </section>
  );
}
