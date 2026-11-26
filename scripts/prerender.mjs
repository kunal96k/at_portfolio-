import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAllErrorPages } from './generateErrorPages.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const distSsrDir = path.resolve(rootDir, 'dist-ssr');
const templatePath = path.resolve(distDir, 'index.html');

async function main() {
  console.log('🚀 Starting Build-Time Prerendering & Static Generation...');

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at ${templatePath}. Run vite build first.`);
  }

  const rawTemplate = fs.readFileSync(templatePath, 'utf-8');

  // Load bundled SSR entry
  const ssrEntryPath = path.resolve(distSsrDir, 'entry-server.js');
  if (!fs.existsSync(ssrEntryPath)) {
    throw new Error(`SSR entry not found at ${ssrEntryPath}.`);
  }

  const { render } = await import(`file://${ssrEntryPath.replace(/\\/g, '/')}`);

  const routes = [
    '/',
    '/about',
    '/upcoming-batches',
    '/training/rhel-linux',
    '/training/cisco-ccna-ccnp',
    '/training/aws-solutions-architect',
    '/training/windows-server',
    '/training/virtualization-cloud',
    '/resources',
    '/testimonials',
    '/blogs',
    '/blogs/build-it-break-it-fix-it-training-methodology',
    '/blogs/preparing-for-rhcsa-rhce-on-rhel',
    '/blogs/from-ccna-fundamentals-to-ccnp-enterprise-routing',
    '/blogs/bridging-on-prem-servers-to-aws-cloud',
    '/gallery',
    '/contact',
    '/privacy-policy',
    '/404',
  ];

  // Prerender verification & analytics tags
  const googleVerification = process.env.VITE_GOOGLE_SITE_VERIFICATION?.trim();
  const bingVerification = process.env.VITE_BING_SITE_VERIFICATION?.trim();
  const siteOrigin = (process.env.VITE_SITE_URL || 'https://arvindthevar.com').replace(/\/+$/, '');
  const now = new Date().toISOString().split('T')[0];
  const sitemapUrls = [];

  for (const route of routes) {
    const { html, seo } = render(route);

    let pageHtml = rawTemplate;

    // Ensure html tag has lang="en-IN"
    pageHtml = pageHtml.replace(/<html(\s+[^>]*)?>/i, '<html lang="en-IN">');

    // Replace <title>
    pageHtml = pageHtml.replace(/<title>.*?<\/title>/is, `<title>${seo.title}</title>`);

    // Replace or inject meta description
    const descTag = `<meta name="description" content="${escapeHtml(seo.description)}" />`;
    if (pageHtml.includes('<meta name="description"')) {
      pageHtml = pageHtml.replace(/<meta\s+name="description"[\s\S]*?>/i, descTag);
    } else {
      pageHtml = pageHtml.replace('</head>', `    ${descTag}\n  </head>`);
    }

    // Replace or inject keywords
    const keywordsTag = `<meta name="keywords" content="${escapeHtml(seo.keywords)}" />`;
    if (pageHtml.includes('<meta name="keywords"')) {
      pageHtml = pageHtml.replace(/<meta\s+name="keywords"[\s\S]*?>/i, keywordsTag);
    }

    // Replace or inject canonical
    const canonicalTag = `<link rel="canonical" href="${seo.canonicalUrl}" />`;
    if (pageHtml.includes('<link rel="canonical"')) {
      pageHtml = pageHtml.replace(/<link\s+rel="canonical"[\s\S]*?>/i, canonicalTag);
    } else {
      pageHtml = pageHtml.replace('</head>', `    ${canonicalTag}\n  </head>`);
    }

    // Set robots tag
    const robotsContent =
      route === '/404'
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    const robotsTag = `<meta name="robots" content="${robotsContent}" />`;
    if (pageHtml.includes('<meta name="robots"')) {
      pageHtml = pageHtml.replace(/<meta\s+name="robots"[\s\S]*?>/i, robotsTag);
    } else {
      pageHtml = pageHtml.replace('</head>', `    ${robotsTag}\n  </head>`);
    }

    // Replace OpenGraph & Twitter tags
    const ogTags = `<!-- SOCIAL_META_START -->
    <!-- OpenGraph Social Metadata -->
    <meta property="og:type" content="${seo.ogType}" />
    <meta property="og:site_name" content="Arvind Thevar" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:url" content="${seo.canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(seo.title)}" />
    <meta property="og:description" content="${escapeHtml(seo.description)}" />
    <meta property="og:image" content="${seo.ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(seo.ogImageAlt)}" />

    <!-- Twitter / X Social Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(seo.description)}" />
    <meta name="twitter:image" content="${seo.ogImage}" />
    <meta name="twitter:image:alt" content="${escapeHtml(seo.ogImageAlt)}" />
    <!-- SOCIAL_META_END -->`;

    // Replace existing OG and Twitter block if present
    if (pageHtml.includes('<!-- SOCIAL_META_START -->')) {
      pageHtml = pageHtml.replace(
        /<!-- SOCIAL_META_START -->[\s\S]*?<!-- SOCIAL_META_END -->/i,
        ogTags.trim()
      );
    } else if (pageHtml.includes('<!-- OpenGraph Social Metadata -->')) {
      pageHtml = pageHtml.replace(
        /<!-- OpenGraph Social Metadata -->[\s\S]*?<!-- Twitter \/ X Social Card -->[\s\S]*?<meta name="twitter:image:alt"[^>]*>/i,
        ogTags.trim()
      );
    }

    // Inject JSON-LD Schema
    const jsonLdScript = `\n    <script type="application/ld+json" data-seo-route="true">\n${JSON.stringify(
      seo.jsonLd,
      null,
      2
    )}\n    </script>\n`;

    if (pageHtml.includes('data-seo-route="true"')) {
      pageHtml = pageHtml.replace(
        /<script type="application\/ld\+json" data-seo-route="true">[\s\S]*?<\/script>/i,
        jsonLdScript.trim()
      );
    } else if (pageHtml.includes('<!-- Schema.org JSON-LD Structured Data -->')) {
      pageHtml = pageHtml.replace(
        /<!-- Schema.org JSON-LD Structured Data -->[\s\S]*?<\/script>/i,
        `<!-- Schema.org JSON-LD Structured Data -->${jsonLdScript}`
      );
    } else {
      pageHtml = pageHtml.replace('</head>', `${jsonLdScript}  </head>`);
    }

    // Process Google and Bing verification tags
    if (googleVerification) {
      pageHtml = pageHtml.replace('%VITE_GOOGLE_SITE_VERIFICATION%', googleVerification);
    } else {
      pageHtml = pageHtml.replace(/<meta\s+name="google-site-verification"[^>]*>\s*/i, '');
    }

    if (bingVerification) {
      pageHtml = pageHtml.replace('%VITE_BING_SITE_VERIFICATION%', bingVerification);
    } else {
      pageHtml = pageHtml.replace(/<meta\s+name="msvalidate\.01"[^>]*>\s*/i, '');
    }

    // Inject prerendered body HTML into #root
    pageHtml = pageHtml.replace(
      /<div id="root"><\/div>/,
      `<div id="root">${html}</div>`
    );

    // Determine target output path
    let targetPath;
    if (route === '/') {
      targetPath = path.resolve(distDir, 'index.html');
    } else if (route === '/404') {
      targetPath = path.resolve(distDir, '404.html');
    } else {
      const cleanPath = route.replace(/^\//, '');
      const folderPath = path.resolve(distDir, cleanPath);
      fs.mkdirSync(folderPath, { recursive: true });
      targetPath = path.resolve(folderPath, 'index.html');
    }

    fs.writeFileSync(targetPath, pageHtml, 'utf-8');
    console.log(`  ✓ Prerendered: ${route} -> ${path.relative(rootDir, targetPath)}`);

    if (route !== '/404') {
      const priority = route === '/' ? '1.0' : route.startsWith('/training/') ? '0.9' : '0.8';
      sitemapUrls.push({
        loc: seo.canonicalUrl,
        lastmod: now,
        priority,
      });
    }
  }

  // Generate XML Sitemap
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
      .map(
        (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`
      )
      .join('\n')}
</urlset>
`;

  fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.resolve(rootDir, 'public', 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`  ✓ Generated sitemap.xml with ${sitemapUrls.length} indexable URLs`);

  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin-dashboard/

Sitemap: ${siteOrigin}/sitemap.xml
`;

  fs.writeFileSync(path.resolve(distDir, 'robots.txt'), robotsTxt, 'utf-8');
  fs.writeFileSync(path.resolve(rootDir, 'public', 'robots.txt'), robotsTxt, 'utf-8');
  console.log(`  ✓ Generated robots.txt`);

  const errCount = generateAllErrorPages({ writeToDist: true });
  console.log(`  ✓ Generated ${errCount} Nginx responsive error & maintenance pages`);

  // Cleanup dist-ssr
  if (fs.existsSync(distSsrDir)) {
    fs.rmSync(distSsrDir, { recursive: true, force: true });
  }

  console.log('✨ Build-time prerendering complete!\n');
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

main().catch((err) => {
  console.error('Prerender error:', err);
  process.exit(1);
});
