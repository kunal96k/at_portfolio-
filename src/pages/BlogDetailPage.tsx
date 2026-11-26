import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Sparkles,
  User,
} from 'lucide-react';
import { sanitizeSafeHref, validateNewsletterEmail } from '../utils/scrollMath';
import { OutlineButton } from '../components/OutlineButton';
import { SafeImage } from '../components/SafeImage';
import {
  fetchPublicBlogBySlugAsync,
  fetchPublicBlogsAsync,
  recordBlogViewBackend,
  type BlogArticle,
} from '../services/blogsService';

interface BlogDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export function BlogDetailPage({ slug, onNavigate }: BlogDetailPageProps) {
  const [post, setPost] = useState<BlogArticle | null>(null);
  const [related, setRelated] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(typeof window !== 'undefined');
  const [visibleCount, setVisibleCount] = useState(2);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const viewedSlugRef = useRef<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setVisibleCount(2);

    void Promise.all([
      fetchPublicBlogBySlugAsync(slug, controller.signal),
      fetchPublicBlogsAsync(),
    ])
      .then(([detailRes, listRes]) => {
        if (controller.signal.aborted) return;
        const resolvedPost = detailRes.item;
        setPost(resolvedPost);
        setRelated(
          listRes.items.filter(
            (item) => !resolvedPost || item.slug !== resolvedPost.slug
          )
        );
        setLoading(false);

        if (
          resolvedPost &&
          detailRes.fromApi &&
          viewedSlugRef.current !== resolvedPost.slug
        ) {
          viewedSlugRef.current = resolvedPost.slug;
          void recordBlogViewBackend(resolvedPost.id).then((updated) => {
            if (updated && !controller.signal.aborted) {
              setPost((prev) =>
                prev && prev.id === updated.id
                  ? { ...prev, viewsCount: updated.viewsCount }
                  : prev
              );
            }
          });
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [slug]);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    const err = validateNewsletterEmail(email);
    setEmailError(err);
    if (!err) {
      setSubscribed(true);
    }
  };

  if (loading && !post) {
    return (
      <main id="main-content" className="relative z-10 px-5 sm:px-8 pt-32 sm:pt-40 pb-24">
        <div className="mx-auto max-w-[1120px] animate-pulse space-y-6">
          <div className="h-12 w-3/4 rounded bg-[#ECECEE] dark:bg-[#2C2C2D]" />
          <div className="h-6 w-1/2 rounded bg-[#ECECEE] dark:bg-[#2C2C2D]" />
          <div className="aspect-[16/9] rounded-[24px] bg-[#ECECEE] dark:bg-[#2C2C2D]" />
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main id="main-content" className="relative z-10 px-5 sm:px-8 pt-32 sm:pt-40 pb-24">
        <div className="mx-auto max-w-[760px] rounded-[24px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-10 text-center">
          <h1 className="font-display text-[36px] sm:text-[48px] font-bold uppercase text-[#303030] dark:text-white">
            Article Not Found
          </h1>
          <p className="mt-3 text-[16px] font-light text-[#5C5C5C] dark:text-white/75">
            This blog guide may have been moved to Draft or removed from the portal.
          </p>
          <div className="mt-6 flex justify-center">
            <OutlineButton onClick={() => onNavigate('/blogs')}>
              BACK TO ALL BLOGS
            </OutlineButton>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="relative z-10 px-5 sm:px-8 pt-32 sm:pt-40 pb-24">
      <article className="mx-auto max-w-[1120px]">
        <button
          type="button"
          onClick={() => onNavigate('/blogs')}
          className="mb-6 inline-flex items-center gap-2 text-[14px] font-medium text-[#5E67E6] dark:text-[#D0FF71] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Insights &amp; Guides</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-[48px] sm:text-[74px] lg:text-[88px] font-bold leading-[1.05] tracking-[-0.02em] uppercase text-[#303030] dark:text-white max-w-[920px]">
            {post.title}
          </h1>
          <p className="mt-5 text-[17px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[700px]">
            {post.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-4 py-0.5 text-[14px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
              {post.category}
            </span>
            {post.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-3.5 py-0.5 text-[12px] font-bold uppercase text-white dark:text-[#1A1A1B]">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                <span>MOST VIEWED</span>
              </span>
            )}
            <span className="text-[15px] font-light text-[#5C5C5C] dark:text-white/70">
              {post.guideLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[14px] font-light text-[#5C5C5C] dark:text-white/70">
              <User className="w-3.5 h-3.5" aria-hidden="true" />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[14px] font-light text-[#5C5C5C] dark:text-white/70">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {post.readTime}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[14px] font-light text-[#5C5C5C] dark:text-white/70 tabular-nums">
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              {post.viewsCount} {post.viewsCount === 1 ? 'view' : 'views'}
            </span>
          </div>

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F5F5F5] dark:bg-[#2C2C2D] px-3 py-1 text-[12px] font-medium text-[#5C5C5C] dark:text-white/75"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mt-10 overflow-hidden rounded-[24px] aspect-[16/9] bg-[#ECECEE] dark:bg-[#2C2C2D]">
            <SafeImage
              src={post.coverImage}
              alt={post.title}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Body Sections */}
        {post.sections.length > 0 && (
          <div className="mt-14 space-y-12 max-w-[820px]">
            {post.sections.map((section, idx) => (
              <div key={idx} className="space-y-5">
                {section.heading && (
                  <h2 className="font-display text-[32px] sm:text-[40px] font-bold uppercase leading-[1.18] text-[#303030] dark:text-white">
                    {section.heading}
                  </h2>
                )}
                {section.body && (
                  <p className="whitespace-pre-line text-[17px] font-light leading-[1.7] text-[#303030] dark:text-white/80">
                    {section.body}
                  </p>
                )}

                {section.images && section.images.length === 1 && (
                  <div className="overflow-hidden rounded-[20px] aspect-[16/10] bg-[#ECECEE] dark:bg-[#2C2C2D]">
                    <SafeImage
                      src={section.images[0]}
                      alt={section.heading}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {section.images && section.images.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {section.images.map((img, imgIdx) => (
                      <div
                        key={imgIdx}
                        className="overflow-hidden rounded-[20px] aspect-[4/3] bg-[#ECECEE] dark:bg-[#2C2C2D]"
                      >
                        <SafeImage
                          src={img}
                          alt={`${section.heading} visual ${imgIdx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Companion Downloads if present */}
        {post.attachments.length > 0 && (
          <div className="mt-14 max-w-[820px] rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-7">
            <h3 className="font-display text-[24px] font-bold uppercase text-[#303030] dark:text-white">
              Companion Lab Files ({post.attachments.length})
            </h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {post.attachments.map((file) => {
                const safeFileUrl = sanitizeSafeHref(file.url);
                if (!safeFileUrl) return null;
                return (
                  <a
                    key={file.id}
                    href={safeFileUrl}
                    download={file.name}
                    className="flex items-center justify-between gap-3 rounded-[14px] bg-white dark:bg-[#1E1E1F] px-4 py-3 text-[14px] text-[#303030] dark:text-white hover:ring-2 hover:ring-[#5E67E6] dark:hover:ring-[#D0FF71]"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <FileText className="w-4 h-4 shrink-0 text-[#5E67E6] dark:text-[#D0FF71]" />
                      <span className="truncate font-medium">{file.name}</span>
                    </span>
                    <Download className="w-4 h-4 shrink-0 text-[#5E67E6] dark:text-[#D0FF71]" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Newsletter Subscription Banner */}
        <div className="mt-20 rounded-[24px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-8 sm:p-12">
          <h3 className="font-display text-[34px] sm:text-[44px] font-bold uppercase text-[#303030] dark:text-white">
            STAY UPDATED ON NEW LABS &amp; BATCHES.
          </h3>
          <p className="mt-3 text-[16px] sm:text-[17px] font-light text-[#303030] dark:text-white/80 max-w-[560px]">
            Receive practical Linux, Cisco networking, cloud study notes and
            upcoming batch announcements directly in your inbox.
          </p>

          {subscribed ? (
            <div className="mt-6 flex items-center gap-3 text-[#5E67E6] dark:text-[#D0FF71]">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="text-[16px] font-medium">
                You’re subscribed! Study notes and updates will be shared with{' '}
                {email}.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              noValidate
              className="mt-6 max-w-[540px]"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  maxLength={150}
                  aria-label="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="Enter your email address"
                  className="flex-1 rounded-full bg-white dark:bg-[#1E1E1F] px-5 py-3.5 text-[15px] font-light text-[#303030] dark:text-white placeholder:text-[#9A9A9A] focus:outline-none focus:ring-2 focus:ring-[#5E67E6] dark:focus:ring-[#D0FF71]"
                />
                <OutlineButton type="submit">SUBSCRIBE</OutlineButton>
              </div>
              {emailError && (
                <p className="mt-2 pl-3 text-[13px] text-[#E53935] dark:text-[#FF7B7B]">
                  {emailError}
                </p>
              )}
            </form>
          )}
        </div>

        {/* More to Discover */}
        {related.length > 0 && (
          <section className="mt-20 pt-16 border-t border-[#E5E5E5] dark:border-[#333335]">
            <h3 className="font-display text-[40px] sm:text-[52px] font-bold uppercase text-[#303030] dark:text-white">
              MORE TO DISCOVER
            </h3>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              {related.slice(0, visibleCount).map((item) => (
                <a
                  key={item.id || item.slug}
                  href={`/blogs/${item.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/blogs/${item.slug}`);
                  }}
                  className="group block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
                >
                  <div className="overflow-hidden rounded-[20px] aspect-[16/10] bg-[#ECECEE] dark:bg-[#2C2C2D]">
                    <SafeImage
                      src={
                        item.coverImage ||
                        '/assets/images/cisco_network_lab_1795164486189.jpg'
                      }
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-3.5 py-0.5 text-[13px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
                      {item.category}
                    </span>
                    <span className="text-[14px] font-light text-[#5C5C5C] dark:text-white/70">
                      {item.guideLabel}
                    </span>
                  </div>
                  <h4 className="mt-3 font-display text-[28px] font-bold uppercase text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-[15px] font-light leading-[1.6] text-[#303030] dark:text-white/75">
                    {item.excerpt}
                  </p>
                </a>
              ))}
            </div>

            {visibleCount < related.length && (
              <div className="mt-12 flex justify-center">
                <OutlineButton
                  onClick={() =>
                    setVisibleCount((c) => Math.min(c + 2, related.length))
                  }
                >
                  LOAD MORE
                </OutlineButton>
              </div>
            )}
          </section>
        )}
      </article>
    </main>
  );
}
