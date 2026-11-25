import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
} from '../config/site';
import {
  BLOGS,
  FAQS,
  GALLERY_ITEMS,
  INITIAL_STUDENT_TESTIMONIALS,
  INITIAL_UPCOMING_BATCHES,
  PROFILE,
  PROJECTS,
  STUDY_RESOURCES,
} from '../data/portfolioData';
import { TRAINING_COURSES, getCourseBySlug } from '../data/coursesData';
import type { AppRoute } from './scrollMath';

export { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT };
export const DEFAULT_SITE_ORIGIN = SITE_URL;

export interface RouteSeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  pathname: string;
  ogType: 'website' | 'article';
  ogImage: string;
  ogImageAlt: string;
  keywords: string;
  jsonLd: Record<string, unknown>;
}

function toAbsoluteUrl(origin: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const cleanOrigin = origin.replace(/\/+$/, '');
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${cleanOrigin}${cleanPath}`;
}

function buildPersonAndOrgEntities(origin: string): Record<string, unknown>[] {
  const siteUrl = toAbsoluteUrl(origin, '/');
  const personId = `${siteUrl}#person`;
  const orgId = `${siteUrl}#organization`;

  return [
    {
      '@type': 'Person',
      '@id': personId,
      name: PROFILE.name,
      jobTitle: PROFILE.roleTitle,
      description: PROFILE.aboutSummary,
      url: siteUrl,
      image: toAbsoluteUrl(origin, '/assets/optimized/arvind_portrait.webp'),
      telephone: PROFILE.phone,
      email: `mailto:${PROFILE.email}`,
      sameAs: PROFILE.socials.map((s) => s.href),
      knowsAbout: [
        'Red Hat Enterprise Linux (RHEL 9)',
        'Cisco CCNA (200-301) & CCNP Enterprise',
        'Amazon Web Services (AWS)',
        'Google Cloud Platform (GCP)',
        'Microsoft Azure Cloud',
        'DevOps, Docker & Kubernetes',
        'VMware ESXi & vCenter Virtualization',
        'Network Security & Firewalls',
        'Enterprise Server Infrastructure',
      ],
      worksFor: { '@id': orgId },
    },
    {
      '@type': 'EducationalOrganization',
      '@id': orgId,
      name: `${PROFILE.name} — IT Infrastructure Training`,
      url: siteUrl,
      logo: toAbsoluteUrl(origin, '/favicon.png'),
      image: toAbsoluteUrl(origin, DEFAULT_OG_IMAGE),
      telephone: PROFILE.phone,
      email: PROFILE.email,
      founder: { '@id': personId },
      sameAs: PROFILE.socials.map((s) => s.href),
      address: {
        '@type': 'PostalAddress',
        streetAddress:
          'Office No-2, First Floor, Kanchawala Avenue, College Rd, near BYK College, Kulkarni Baug',
        addressLocality: 'Nashik',
        addressRegion: 'Maharashtra',
        postalCode: '422005',
        addressCountry: 'IN',
      },
      areaServed: ['Nashik', 'Maharashtra', 'India', 'Online Worldwide'],
    },
  ];
}

function buildBreadcrumbList(
  origin: string,
  crumbs: { name: string; path: string }[]
): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: toAbsoluteUrl(origin, crumb.path),
    })),
  };
}

export function buildRouteSeo(
  route: AppRoute,
  origin: string = DEFAULT_SITE_ORIGIN
): RouteSeoMetadata {
  const cleanOrigin = origin.replace(/\/+$/, '');
  const siteUrl = `${cleanOrigin}/`;
  const baseEntities = buildPersonAndOrgEntities(cleanOrigin);
  const orgRef = { '@id': `${siteUrl}#organization` };
  const personRef = { '@id': `${siteUrl}#person` };

  switch (route.page) {
    case 'about': {
      const pathname = '/about';
      return {
        title: 'About Arvind Thevar | IT Infrastructure & Cloud Trainer',
        description:
          'Meet Arvind Thevar, an IT Trainer with 15+ years mentoring engineers in Red Hat Linux (RHEL), Cisco CCNA, AWS Cloud Architecture, and DevOps automation.',
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'website',
        ogImage: toAbsoluteUrl(cleanOrigin, DEFAULT_OG_IMAGE),
        ogImageAlt: 'Arvind Thevar — IT Trainer & IT Infrastructure Professional',
        keywords:
          'About Arvind Thevar, Red Hat Linux Trainer Nashik, Cisco CCNA Trainer India, AWS Cloud DevOps Mentor, RHCSA RHCE classes',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            {
              '@type': 'AboutPage',
              url: toAbsoluteUrl(cleanOrigin, pathname),
              name: 'About Arvind Thevar',
              mainEntity: personRef,
            },
            buildBreadcrumbList(cleanOrigin, [
              { name: 'Home', path: '/' },
              { name: 'About Us', path: pathname },
            ]),
          ],
        },
      };
    }

    case 'upcoming-training': {
      const pathname = '/upcoming-training';
      return {
        title: 'Upcoming IT Batches | Red Hat Linux, CCNA, AWS & DevOps',
        description:
          'Join upcoming hands-on training batches in Red Hat Linux (RHEL), Cisco CCNA, AWS Cloud, and DevOps automation with live production fault troubleshooting.',
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'website',
        ogImage: toAbsoluteUrl(cleanOrigin, '/assets/optimized/linux_rhel_lab_1795164484674.webp'),
        ogImageAlt: 'Red Hat Linux, Cisco CCNA & AWS upcoming batches and labs',
        keywords:
          'Upcoming RHEL batch, Cisco CCNA training Nashik, AWS Cloud course, DevOps Kubernetes training, RHCSA RHCE classes',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            {
              '@type': 'ItemList',
              name: 'Upcoming IT Infrastructure Training Batches',
              itemListElement: INITIAL_UPCOMING_BATCHES.map((batch, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'Course',
                  name: batch.title,
                  description: batch.summary,
                  provider: orgRef,
                  courseMode: batch.mode,
                  educationalLevel: 'Beginner to Advanced',
                },
              })),
            },
            buildBreadcrumbList(cleanOrigin, [
              { name: 'Home', path: '/' },
              { name: 'Upcoming Batches', path: pathname },
            ]),
          ],
        },
      };
    }

    case 'it-services': {
      const pathname = '/it-services';
      return {
        title: 'IT Services & Corporate Training | Arvind Thevar',
        description:
          'Enterprise IT infrastructure services, Red Hat Linux, Cisco CCNA/CCNP, multi-cloud (AWS, GCP, Azure), DevOps, and VMware virtualization by Arvind Thevar.',
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'website',
        ogImage: toAbsoluteUrl(
          cleanOrigin,
          '/assets/optimized/corporate_it_workshop_1795164484663.webp'
        ),
        ogImageAlt: 'Corporate IT infrastructure training and workshops',
        keywords:
          'Red Hat Linux consulting, Cisco CCNA CCNP networking, AWS GCP Azure cloud, DevOps VMware Nashik, Corporate IT training India',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            {
              '@type': 'Service',
              name: 'Enterprise IT Infrastructure Services & Corporate Training',
              provider: orgRef,
              serviceType: [
                'Red Hat Enterprise Linux Training & Administration',
                'Cisco CCNA & CCNP Enterprise Networking',
                'Multi-Cloud Architecture (AWS, GCP, Azure)',
                'DevOps, Docker, Kubernetes & CI/CD Automation',
                'VMware Virtualization & Server Infrastructure',
              ],
            },
            buildBreadcrumbList(cleanOrigin, [
              { name: 'Home', path: '/' },
              { name: 'IT Services', path: pathname },
            ]),
          ],
        },
      };
    }

    case 'resources': {
      const pathname = '/resources';
      return {
        title: 'Free RHEL, CCNA, AWS & DevOps Notes & Lab Manuals',
        description:
          'Download 100% free Red Hat Linux (RHEL), Cisco CCNA, AWS Cloud, and DevOps study notes, lab workbooks, and troubleshooting guides with zero hidden charges.',
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'website',
        ogImage: toAbsoluteUrl(cleanOrigin, DEFAULT_OG_IMAGE),
        ogImageAlt: 'Free RHEL, Cisco CCNA, and AWS study notes and lab workbooks',
        keywords:
          'Free RHEL notes PDF, Cisco CCNA study material, AWS lab workbook free, DevOps Docker Kubernetes notes, RHCSA lab manual',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            {
              '@type': 'CollectionPage',
              name: 'Free IT Infrastructure Study Notes & Lab Manuals',
              url: toAbsoluteUrl(cleanOrigin, pathname),
              mainEntity: {
                '@type': 'ItemList',
                itemListElement: STUDY_RESOURCES.map((res, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  item: {
                    '@type': 'LearningResource',
                    name: res.title,
                    description: res.summary,
                    learningResourceType: res.sectionType,
                    isAccessibleForFree: true,
                    url: toAbsoluteUrl(cleanOrigin, res.fileUrl),
                    author: personRef,
                  },
                })),
              },
            },
            buildBreadcrumbList(cleanOrigin, [
              { name: 'Home', path: '/' },
              { name: 'Notes & Resources', path: pathname },
            ]),
          ],
        },
      };
    }

    case 'testimonials': {
      const pathname = '/testimonials';
      return {
        title: 'Student Testimonials & Placements | Arvind Thevar',
        description:
          'Read verified stories from placed IT professionals and institutional partners trained in Red Hat Linux, Cisco CCNA, AWS Cloud, and DevOps.',
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'website',
        ogImage: toAbsoluteUrl(cleanOrigin, DEFAULT_OG_IMAGE),
        ogImageAlt: 'Student testimonials and placements from Arvind Thevar IT training',
        keywords:
          'Arvind Thevar reviews, IT training student placements Nashik, CCNA RHEL student testimonials',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            {
              '@type': 'ItemList',
              name: 'Verified Student Testimonials',
              itemListElement: INITIAL_STUDENT_TESTIMONIALS.map((student, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'Review',
                  author: { '@type': 'Person', name: student.name },
                  reviewBody: student.quote,
                  itemReviewed: {
                    '@type': 'Course',
                    name: student.course,
                    provider: orgRef,
                  },
                },
              })),
            },
            buildBreadcrumbList(cleanOrigin, [
              { name: 'Home', path: '/' },
              { name: 'Student Testimonials', path: pathname },
            ]),
          ],
        },
      };
    }

    case 'projects': {
      const pathname = '/projects';
      return {
        title: 'Hands-On IT Lab Tracks & Corporate Programs | Arvind Thevar',
        description:
          'Explore lab-driven IT infrastructure tracks in RHEL, Cisco CCNA/CCNP, AWS Cloud, and verified corporate and institutional training programs.',
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'website',
        ogImage: toAbsoluteUrl(
          cleanOrigin,
          '/assets/optimized/cisco_network_lab_1795164486189.webp'
        ),
        ogImageAlt: 'Hands-on Cisco networking and Red Hat Linux lab tracks',
        keywords:
          'RHEL RHCSA lab track, Cisco CCNP enterprise networking labs, AWS cloud labs, institutional IT workshops',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            {
              '@type': 'CollectionPage',
              name: 'Hands-On IT Lab Tracks',
              url: toAbsoluteUrl(cleanOrigin, pathname),
              mainEntity: {
                '@type': 'ItemList',
                itemListElement: PROJECTS.map((project, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  url: toAbsoluteUrl(cleanOrigin, `/projects/${project.slug}`),
                  name: project.title,
                })),
              },
            },
            buildBreadcrumbList(cleanOrigin, [
              { name: 'Home', path: '/' },
              { name: 'Lab Tracks', path: pathname },
            ]),
          ],
        },
      };
    }

    case 'project-detail': {
      const project = PROJECTS.find((p) => p.slug === route.slug) ?? PROJECTS[0];
      const pathname = `/projects/${project.slug}`;
      const rawTitle = `${project.title} | Arvind Thevar`;
      const title = rawTitle.length > 62 ? `${project.title.slice(0, 44)} | Arvind Thevar` : rawTitle;
      const desc =
        project.shortDescription.length > 158
          ? `${project.shortDescription.slice(0, 155).trim()}...`
          : project.shortDescription.length < 120
            ? `${project.shortDescription} Hands-on enterprise IT lab training led by Arvind Thevar.`
            : project.shortDescription;

      return {
        title,
        description: desc,
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'article',
        ogImage: toAbsoluteUrl(cleanOrigin, project.coverImage),
        ogImageAlt: project.title,
        keywords: `${project.title}, ${project.category}, ${project.industry}, Arvind Thevar`,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            {
              '@type': 'Course',
              name: project.title,
              description: project.shortDescription,
              provider: orgRef,
              image: toAbsoluteUrl(cleanOrigin, project.coverImage),
              url: toAbsoluteUrl(cleanOrigin, pathname),
            },
            buildBreadcrumbList(cleanOrigin, [
              { name: 'Home', path: '/' },
              { name: 'Lab Tracks', path: '/projects' },
              { name: project.title, path: pathname },
            ]),
          ],
        },
      };
    }

    case 'blogs': {
      const pathname = '/blogs';
      return {
        title: 'IT Infrastructure Blogs & Lab Guides | Arvind Thevar',
        description:
          'Read practical guides on Red Hat Linux (RHCSA/RHCE), Cisco CCNA/CCNP routing, AWS cloud migration, and real-world troubleshooting labs.',
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'website',
        ogImage: toAbsoluteUrl(
          cleanOrigin,
          '/assets/optimized/hands_on_troubleshooting_1795164485759.webp'
        ),
        ogImageAlt: 'IT Infrastructure Insights and Lab Guides by Arvind Thevar',
        keywords:
          'Linux RHEL blog, Cisco CCNA CCNP guide, AWS cloud migration article, IT troubleshooting methodology',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            {
              '@type': 'Blog',
              name: 'Arvind Thevar Infrastructure Insights & Guides',
              url: toAbsoluteUrl(cleanOrigin, pathname),
              publisher: orgRef,
              blogPost: BLOGS.map((post) => ({
                '@type': 'BlogPosting',
                headline: post.title,
                description: post.excerpt,
                url: toAbsoluteUrl(cleanOrigin, `/blogs/${post.slug}`),
                image: toAbsoluteUrl(cleanOrigin, post.coverImage),
                author: personRef,
              })),
            },
            buildBreadcrumbList(cleanOrigin, [
              { name: 'Home', path: '/' },
              { name: 'Blogs', path: pathname },
            ]),
          ],
        },
      };
    }

    case 'blog-detail': {
      const post = BLOGS.find((b) => b.slug === route.slug) ?? BLOGS[0];
      const pathname = `/blogs/${post.slug}`;
      const rawTitle = `${post.title} | Arvind Thevar`;
      const title = rawTitle.length > 64 ? `${post.title.slice(0, 46)} | Arvind Thevar` : rawTitle;
      const desc =
        post.excerpt.length > 158
          ? `${post.excerpt.slice(0, 155).trim()}...`
          : post.excerpt.length < 120
            ? `${post.excerpt} Practical infrastructure guide by Arvind Thevar.`
            : post.excerpt;

      return {
        title,
        description: desc,
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'article',
        ogImage: toAbsoluteUrl(cleanOrigin, post.coverImage),
        ogImageAlt: post.title,
        keywords: `${post.category}, ${post.title}, IT Infrastructure Guide, Arvind Thevar`,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            {
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.excerpt,
              articleSection: post.category,
              image: toAbsoluteUrl(cleanOrigin, post.coverImage),
              url: toAbsoluteUrl(cleanOrigin, pathname),
              mainEntityOfPage: toAbsoluteUrl(cleanOrigin, pathname),
              author: personRef,
              publisher: orgRef,
            },
            buildBreadcrumbList(cleanOrigin, [
              { name: 'Home', path: '/' },
              { name: 'Blogs', path: '/blogs' },
              { name: post.title, path: pathname },
            ]),
          ],
        },
      };
    }

    case 'gallery': {
      const pathname = '/gallery';
      return {
        title: 'IT Lab & Training Workshop Gallery | Arvind Thevar',
        description:
          'View real snapshots of Cisco networking racks, Red Hat Linux server labs, troubleshooting desks, and corporate workshops by Arvind Thevar.',
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'website',
        ogImage: toAbsoluteUrl(
          cleanOrigin,
          '/assets/optimized/cisco_network_lab_1795164486189.webp'
        ),
        ogImageAlt: 'IT training workshops and enterprise networking labs gallery',
        keywords:
          'Cisco lab photos, Red Hat Linux server rack, IT training workshop gallery Nashik, Arvind Thevar labs',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            {
              '@type': 'ImageGallery',
              name: 'Arvind Thevar Training & Enterprise Lab Gallery',
              url: toAbsoluteUrl(cleanOrigin, pathname),
              associatedMedia: GALLERY_ITEMS.map((item) => ({
                '@type': 'ImageObject',
                name: item.title,
                caption: item.caption,
                contentUrl: toAbsoluteUrl(cleanOrigin, item.image),
              })),
            },
            buildBreadcrumbList(cleanOrigin, [
              { name: 'Home', path: '/' },
              { name: 'Gallery', path: pathname },
            ]),
          ],
        },
      };
    }

    case 'training-course': {
      const course = getCourseBySlug(route.slug) ?? TRAINING_COURSES[0];
      const pathname = `/training/${course.slug}`;
      const title = `${course.shortTitle} Training in Nashik & Online | Arvind Thevar`;
      const description = `${course.summary.slice(0, 145)}... Practical lab-driven training in Nashik.`;

      return {
        title,
        description,
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'website',
        ogImage: toAbsoluteUrl(cleanOrigin, DEFAULT_OG_IMAGE),
        ogImageAlt: `${course.title} by Arvind Thevar`,
        keywords: `${course.shortTitle}, ${course.badge}, ${course.certification}, IT training Nashik, Arvind Thevar`,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            {
              '@type': 'Course',
              '@id': `${toAbsoluteUrl(cleanOrigin, pathname)}#course`,
              name: course.title,
              description: course.summary,
              provider: orgRef,
              educationalCredentialAwarded: course.certification,
              hasCourseInstance: {
                '@type': 'CourseInstance',
                courseMode: 'Blended',
                location: {
                  '@type': 'Place',
                  name: 'Arvind Thevar Training Center',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress:
                      'Office No-2, First Floor, Kanchawala Avenue, College Rd, near BYK College',
                    addressLocality: 'Nashik',
                    addressRegion: 'Maharashtra',
                    postalCode: '422005',
                    addressCountry: 'IN',
                  },
                },
              },
            },
            buildBreadcrumbList(cleanOrigin, [
              { name: 'Home', path: '/' },
              { name: 'Upcoming Batches', path: '/upcoming-training' },
              { name: course.shortTitle, path: pathname },
            ]),
          ],
        },
      };
    }

    case 'contact': {
      const pathname = '/contact';
      return {
        title: 'Contact Arvind Thevar | IT Infrastructure Training Nashik',
        description:
          'Get in touch with Arvind Thevar for upcoming Red Hat Linux, Cisco CCNA/CCNP, and AWS batch schedules in Nashik or live online. Call +91 88888 29652.',
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'website',
        ogImage: toAbsoluteUrl(cleanOrigin, DEFAULT_OG_IMAGE),
        ogImageAlt: 'Contact Arvind Thevar IT Infrastructure Training Nashik',
        keywords:
          'Contact Arvind Thevar, IT training Nashik contact number, Linux batch inquiries Nashik, Cisco CCNA classes Nashik',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            {
              '@type': 'ContactPage',
              url: toAbsoluteUrl(cleanOrigin, pathname),
              name: 'Contact Arvind Thevar',
              mainEntity: personRef,
            },
            buildBreadcrumbList(cleanOrigin, [
              { name: 'Home', path: '/' },
              { name: 'Contact', path: pathname },
            ]),
          ],
        },
      };
    }

    case 'privacy-policy': {
      const pathname = '/privacy-policy';
      return {
        title: 'Privacy Policy | Arvind Thevar IT Infrastructure Training',
        description:
          'Privacy Policy and data transparency practices for Arvind Thevar IT infrastructure training inquiries and student consultation.',
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'website',
        ogImage: toAbsoluteUrl(cleanOrigin, DEFAULT_OG_IMAGE),
        ogImageAlt: 'Privacy Policy — Arvind Thevar',
        keywords: 'Privacy Policy, Arvind Thevar, IT Training Nashik data policy',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            buildBreadcrumbList(cleanOrigin, [
              { name: 'Home', path: '/' },
              { name: 'Privacy Policy', path: pathname },
            ]),
          ],
        },
      };
    }

    case 'not-found': {
      const pathname = '/404';
      return {
        title: '404 — Page Not Found | Arvind Thevar',
        description:
          'The page you requested could not be found. Explore hands-on Red Hat Linux, Cisco CCNA, and AWS cloud training tracks with Arvind Thevar.',
        canonicalUrl: toAbsoluteUrl(cleanOrigin, pathname),
        pathname,
        ogType: 'website',
        ogImage: toAbsoluteUrl(cleanOrigin, DEFAULT_OG_IMAGE),
        ogImageAlt: '404 Page Not Found — Arvind Thevar',
        keywords: '404, Page Not Found, Arvind Thevar',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [...baseEntities],
        },
      };
    }

    case 'home':
    default: {
      const pathname = '/';
      return {
        title: 'Arvind Thevar | RHEL, CCNA, AWS & DevOps Trainer Nashik',
        description:
          'Hands-on IT training in Nashik & online by Arvind Thevar (15+ yrs). Master Red Hat Linux (RHEL), Cisco CCNA, AWS Cloud Architecture, and DevOps automation.',
        canonicalUrl: siteUrl,
        pathname,
        ogType: 'website',
        ogImage: toAbsoluteUrl(cleanOrigin, DEFAULT_OG_IMAGE),
        ogImageAlt: 'Arvind Thevar — IT Trainer & IT Infrastructure Professional',
        keywords:
          'Arvind Thevar, IT Trainer Nashik, Red Hat Linux RHEL, RHCSA RHCE, Cisco CCNA 200-301, AWS Cloud Architecture, DevOps Docker Kubernetes, IT Infrastructure labs',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            ...baseEntities,
            {
              '@type': 'WebSite',
              '@id': `${siteUrl}#website`,
              url: siteUrl,
              name: `${PROFILE.name} — ${PROFILE.roleTitle}`,
              description: PROFILE.heroTagline,
              publisher: orgRef,
              inLanguage: 'en-IN',
            },
            {
              '@type': 'FAQPage',
              '@id': `${siteUrl}#faq`,
              mainEntity: FAQS.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            },
            buildBreadcrumbList(cleanOrigin, [{ name: 'Home', path: '/' }]),
          ],
        },
      };
    }
  }
}

export function getAllPublicSitemapPaths(): string[] {
  return [
    '/',
    '/about',
    '/upcoming-training',
    ...TRAINING_COURSES.map((c) => `/training/${c.slug}`),
    '/resources',
    '/testimonials',
    '/blogs',
    ...BLOGS.map((b) => `/blogs/${b.slug}`),
    '/gallery',
    '/contact',
    '/privacy-policy',
  ];
}

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  if (typeof document === 'undefined') return;
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertCanonicalLink(href: string): void {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLd(data: Record<string, unknown>): void {
  if (typeof document === 'undefined') return;
  let script = document.head.querySelector<HTMLScriptElement>(
    'script[type="application/ld+json"][data-seo-route="true"]'
  );
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-route', 'true');
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function applyRouteSeoToDocument(route: AppRoute): RouteSeoMetadata {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : DEFAULT_SITE_ORIGIN;
  const seo = buildRouteSeo(route, origin);

  if (typeof document !== 'undefined') {
    document.title = seo.title;
    upsertMetaTag('name', 'description', seo.description);
    upsertMetaTag('name', 'keywords', seo.keywords);
    upsertMetaTag('property', 'og:title', seo.title);
    upsertMetaTag('property', 'og:description', seo.description);
    upsertMetaTag('property', 'og:type', seo.ogType);
    upsertMetaTag('property', 'og:url', seo.canonicalUrl);
    upsertMetaTag('property', 'og:image', seo.ogImage);
    upsertMetaTag('property', 'og:image:alt', seo.ogImageAlt);
    upsertMetaTag('property', 'og:image:width', '1200');
    upsertMetaTag('property', 'og:image:height', '630');
    upsertMetaTag('property', 'og:site_name', SITE_NAME);
    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('name', 'twitter:title', seo.title);
    upsertMetaTag('name', 'twitter:description', seo.description);
    upsertMetaTag('name', 'twitter:image', seo.ogImage);
    upsertMetaTag('name', 'twitter:image:alt', seo.ogImageAlt);
    if (route.page === 'not-found') {
      upsertMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      upsertMetaTag(
        'name',
        'robots',
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      );
    }
    upsertCanonicalLink(seo.canonicalUrl);
    upsertJsonLd(seo.jsonLd);
  }

  return seo;
}
