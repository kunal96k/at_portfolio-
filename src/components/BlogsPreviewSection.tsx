import { useEffect, useState } from 'react';
import { BookOpen, FileText, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import {
  BLOGS_STORAGE_KEY,
  BLOGS_UPDATED_EVENT,
  fetchPublicBlogsAsync,
  type BlogArticle,
} from '../services/blogsService';
import { useResponsiveReveal } from '../hooks/useResponsiveReveal';
import { OutlineButton } from './OutlineButton';
import { SafeImage } from './SafeImage';

interface BlogsPreviewSectionProps {
  onNavigate: (path: string) => void;
  onContactClick?: () => void;
}

export function BlogsPreviewSection({
  onNavigate,
  onContactClick,
}: BlogsPreviewSectionProps) {
  const [posts, setPosts] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const headerReveal = useResponsiveReveal(0.25, 0.6);
  const cardReveal = useResponsiveReveal(0.15, 0.6);

  useEffect(() => {
    let active = true;
    const loadPosts = () => {
      void fetchPublicBlogsAsync()
        .then((res) => {
          if (active) {
            setPosts(res.items.slice(0, 2));
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) {
            setPosts([]);
            setLoading(false);
          }
        });
    };
    loadPosts();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === BLOGS_STORAGE_KEY) {
        loadPosts();
      }
    };
    window.addEventListener(BLOGS_UPDATED_EVENT, loadPosts);
    window.addEventListener('storage', handleStorage);
    return () => {
      active = false;
      window.removeEventListener(BLOGS_UPDATED_EVENT, loadPosts);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleConsultClick = () => {
    if (onContactClick) {
      onContactClick();
      return;
    }
    onNavigate('/contact');
  };

  return (
    <section
      aria-label="Infrastructure Insights and Study Guides"
      className="relative z-10 w-full px-5 sm:px-8 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-[1120px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={headerReveal.viewport}
          transition={{ duration: headerReveal.duration, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div className="max-w-[580px]">
            <h2 className="font-display text-[44px] sm:text-[56px] lg:text-[60px] font-bold leading-[1.15] uppercase text-[#303030] dark:text-white">
              INFRASTRUCTURE INSIGHTS &amp; GUIDES
            </h2>
            <p className="mt-4 text-[16px] sm:text-[18px] font-light leading-[1.55] text-[#303030] dark:text-white/80">
              Practical guides on Linux administration, Cisco networking, cloud
              migration and live troubleshooting methodology.
            </p>
          </div>
          {posts.length > 0 && (
            <OutlineButton onClick={() => onNavigate('/blogs')}>
              VIEW ALL GUIDES
            </OutlineButton>
          )}
        </motion.div>

        {loading && posts.length === 0 ? (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {[0, 1].map((skeleton) => (
              <div
                key={skeleton}
                className="animate-pulse rounded-[20px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-5"
              >
                <div className="aspect-[16/10] rounded-[16px] bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                <div className="mt-5 h-5 w-1/3 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                <div className="mt-3 h-7 w-4/5 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div
            data-testid="blogs-empty-state"
            className="mt-10 rounded-[26px] border border-dashed border-[#D6D8E4] bg-[#F5F5F5] px-6 py-12 text-center sm:px-10 sm:py-16 dark:border-[#3A3A3E] dark:bg-[#252528]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5E67E6]/12 text-[#5E67E6] dark:bg-[#D0FF71]/15 dark:text-[#D0FF71]">
              <BookOpen className="h-8 w-8" aria-hidden="true" />
            </div>

            <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#5E67E6] shadow-xs dark:bg-[#1C1C1E] dark:text-[#D0FF71]">
              Insights Update
            </p>

            <h3 className="mx-auto mt-3 max-w-[560px] font-display text-[28px] font-bold uppercase leading-[1.12] text-[#303030] sm:text-[36px] dark:text-white">
              NO FEATURED ARTICLES AVAILABLE RIGHT NOW
            </h3>

            <p className="mx-auto mt-3 max-w-[540px] text-[15px] leading-[1.65] font-light text-[#5C5C5C] sm:text-[16px] dark:text-white/75">
              Our infrastructure knowledge base is currently being updated with
              fresh Red Hat Linux, Cisco networking, AWS cloud, and live lab
              troubleshooting guides. Browse free study notes or book a
              consultation in the meantime.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/blogs')}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#5E67E6] px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 dark:bg-[#D0FF71] dark:text-[#1A1A1B] cursor-pointer"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>Browse All Guides</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/resources')}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-[#303030]/20 bg-white px-5 py-3 text-[14px] font-medium text-[#303030] transition-colors hover:bg-[#303030] hover:text-white dark:border-white/20 dark:bg-[#1E1E20] dark:text-white dark:hover:bg-white dark:hover:text-[#1A1A1B] cursor-pointer"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span>Free Study Notes</span>
              </button>

              <button
                type="button"
                onClick={handleConsultClick}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-transparent px-4 py-3 text-[14px] font-medium text-[#5E67E6] hover:underline dark:text-[#D0FF71] cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                <span>Book Consultation</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              {posts.map((post, idx) => (
                <motion.a
                  key={post.id || post.slug}
                  href={`/blogs/${post.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/blogs/${post.slug}`);
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={cardReveal.viewport}
                  transition={{
                    duration: cardReveal.duration,
                    delay: cardReveal.isCompactViewport ? 0 : idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71] rounded-[20px]"
                >
                  <div className="overflow-hidden rounded-[20px] aspect-[16/10] bg-[#ECECEE] dark:bg-[#2C2C2D]">
                    <SafeImage
                      src={
                        post.coverImage ||
                        '/assets/images/cisco_network_lab_1795164486189.jpg'
                      }
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-3.5 py-0.5 text-[13px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
                      {post.category}
                    </span>
                    <span className="text-[14px] font-light text-[#5C5C5C] dark:text-white/70">
                      {post.guideLabel}
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
              <OutlineButton onClick={() => onNavigate('/blogs')}>
                BROWSE ALL GUIDES
              </OutlineButton>
              <OutlineButton onClick={() => onNavigate('/resources')}>
                NOTES &amp; LAB SECTIONS
              </OutlineButton>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
