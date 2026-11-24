import { motion } from 'motion/react';
import { BLOGS } from '../data/portfolioData';
import { SafeImage } from '../components/SafeImage';

interface BlogsPageProps {
  onNavigate: (path: string) => void;
}

export function BlogsPage({ onNavigate }: BlogsPageProps) {
  const featuredPost = BLOGS.find((b) => b.mostViewed) ?? BLOGS[0];
  const restPosts = BLOGS.filter((b) => b.slug !== featuredPost.slug);

  return (
    <main className="relative z-10 px-5 sm:px-8 pt-32 sm:pt-40 pb-24">
      <div className="mx-auto max-w-[1120px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[780px]"
        >
          <h1 className="font-display text-[56px] sm:text-[82px] lg:text-[98px] font-bold leading-[1.03] tracking-[-0.02em] uppercase text-[#303030] dark:text-white">
            INFRASTRUCTURE INSIGHTS &amp; GUIDES
          </h1>
          <p className="mt-4 text-[16px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[560px]">
            Practical articles on Red Hat Linux, Cisco networking, Windows Server, cloud migration
            and live troubleshooting—shaped by 15+ years of real industry experience.
          </p>
        </motion.div>

        {/* Featured MOST VIEWED Hero Article Card matching ref-blogs-top.png */}
        <motion.a
          href={`/blogs/${featuredPost.slug}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(`/blogs/${featuredPost.slug}`);
          }}
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="group mt-12 block rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
        >
          <div className="relative overflow-hidden rounded-[24px] aspect-[16/9] sm:aspect-[16/8.5] bg-[#ECECEE] dark:bg-[#2C2C2D]">
            <SafeImage
              src={featuredPost.coverImage}
              alt={featuredPost.title}
              loading="eager"
              className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
            <span className="absolute top-5 left-5 inline-flex items-center rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-5 py-1.5 font-display text-[18px] sm:text-[22px] font-bold uppercase tracking-wide text-white dark:text-[#1A1A1B] shadow-md">
              MOST VIEWED
            </span>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-3.5 py-0.5 text-[13px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
              {featuredPost.category}
            </span>
            <span className="text-[14px] font-light text-[#5C5C5C] dark:text-white/70">
              {featuredPost.date}
            </span>
          </div>

          <h2 className="mt-3.5 font-display text-[32px] sm:text-[42px] font-bold uppercase leading-[1.15] text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors">
            {featuredPost.title}
          </h2>
          <p className="mt-2.5 max-w-[680px] text-[16px] sm:text-[17px] font-light leading-[1.6] text-[#303030] dark:text-white/75">
            {featuredPost.excerpt}
          </p>
        </motion.a>

        {/* Remaining Articles 2-Column Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
          {restPosts.map((post, idx) => (
            <motion.a
              key={post.slug}
              href={`/blogs/${post.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`/blogs/${post.slug}`);
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: idx * 0.05 }}
              className="group block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
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

              <h3 className="mt-3 font-display text-[28px] sm:text-[32px] font-bold uppercase leading-[1.2] text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors">
                {post.title}
              </h3>

              <p className="mt-2 text-[15px] sm:text-[16px] font-light leading-[1.6] text-[#303030] dark:text-white/75">
                {post.excerpt}
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </main>
  );
}
