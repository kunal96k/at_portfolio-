import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { BLOGS } from '../data/portfolioData';
import { validateNewsletterEmail } from '../utils/scrollMath';
import { OutlineButton } from '../components/OutlineButton';
import { SafeImage } from '../components/SafeImage';

interface BlogDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export function BlogDetailPage({ slug, onNavigate }: BlogDetailPageProps) {
  const post = BLOGS.find((b) => b.slug === slug) ?? BLOGS[0];
  const related = BLOGS.filter((b) => b.slug !== post.slug);
  const [visibleCount, setVisibleCount] = useState(2);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    const err = validateNewsletterEmail(email);
    setEmailError(err);
    if (!err) {
      setSubscribed(true);
    }
  };

  return (
    <main className="relative z-10 px-5 sm:px-8 pt-32 sm:pt-40 pb-24">
      <article className="mx-auto max-w-[1120px]">
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
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-4 py-0.5 text-[14px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
              {post.category}
            </span>
            <span className="text-[15px] font-light text-[#5C5C5C] dark:text-white/70">
              {post.date}
            </span>
          </div>
        </motion.div>

        {/* Cover Image */}
        <div className="mt-10 overflow-hidden rounded-[24px] aspect-[16/9] bg-[#ECECEE] dark:bg-[#2C2C2D]">
          <SafeImage
            src={post.coverImage}
            alt={post.title}
            loading="eager"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Body Sections */}
        <div className="mt-14 space-y-12 max-w-[820px]">
          {post.sections.map((section, idx) => (
            <div key={idx} className="space-y-5">
              <h2 className="font-display text-[32px] sm:text-[40px] font-bold uppercase leading-[1.18] text-[#303030] dark:text-white">
                {section.heading}
              </h2>
              <p className="text-[17px] font-light leading-[1.7] text-[#303030] dark:text-white/80">
                {section.body}
              </p>

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

        {/* Newsletter Subscription Banner matching Portavia */}
        <div className="mt-20 rounded-[24px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-8 sm:p-12">
          <h3 className="font-display text-[34px] sm:text-[44px] font-bold uppercase text-[#303030] dark:text-white">
            STAY UPDATED ON NEW LABS &amp; BATCHES.
          </h3>
          <p className="mt-3 text-[16px] sm:text-[17px] font-light text-[#303030] dark:text-white/80 max-w-[560px]">
            Receive practical Linux, Cisco networking, cloud study notes and upcoming batch
            announcements directly in your inbox.
          </p>

          {subscribed ? (
            <div className="mt-6 flex items-center gap-3 text-[#5E67E6] dark:text-[#D0FF71]">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="text-[16px] font-medium">
                You’re subscribed! Study notes and updates will be shared with {email}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} noValidate className="mt-6 max-w-[540px]">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  aria-label="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="you@example.com"
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
        <section className="mt-20 pt-16 border-t border-[#E5E5E5] dark:border-[#333335]">
          <h3 className="font-display text-[40px] sm:text-[52px] font-bold uppercase text-[#303030] dark:text-white">
            MORE TO DISCOVER
          </h3>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            {related.slice(0, visibleCount).map((item) => (
              <a
                key={item.slug}
                href={`/blogs/${item.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(`/blogs/${item.slug}`);
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
                <div className="mt-4 flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-3.5 py-0.5 text-[13px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
                    {item.category}
                  </span>
                  <span className="text-[14px] font-light text-[#5C5C5C] dark:text-white/70">
                    {item.date}
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
                onClick={() => setVisibleCount((c) => Math.min(c + 2, related.length))}
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
