import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BLOGS, PROJECTS } from '../data/portfolioData';
import {
  buildRouteSeo,
  DEFAULT_SITE_ORIGIN,
  getAllPublicSitemapPaths,
} from './seo';
import type { AppRoute } from './scrollMath';

const ALL_TEST_ROUTES: AppRoute[] = [
  { page: 'home' },
  { page: 'about' },
  { page: 'upcoming-batches' },
  { page: 'it-services' },
  { page: 'resources' },
  { page: 'testimonials' },
  { page: 'projects' },
  ...PROJECTS.map((p): AppRoute => ({ page: 'project-detail', slug: p.slug })),
  { page: 'blogs' },
  ...BLOGS.map((b): AppRoute => ({ page: 'blog-detail', slug: b.slug })),
  { page: 'gallery' },
];

test('every public route generates optimal SEO title (<=65 chars), description (120-160 chars), canonical, and JSON-LD', () => {
  for (const route of ALL_TEST_ROUTES) {
    const seo = buildRouteSeo(route, DEFAULT_SITE_ORIGIN);

    assert.ok(
      seo.title.length >= 28 && seo.title.length <= 65,
      `Title length out of range (${seo.title.length}) for ${route.page}: "${seo.title}"`
    );
    assert.ok(
      seo.description.length >= 115 && seo.description.length <= 165,
      `Description length out of range (${seo.description.length}) for ${route.page}: "${seo.description}"`
    );
    assert.ok(
      seo.canonicalUrl.startsWith(DEFAULT_SITE_ORIGIN),
      `Canonical URL must start with origin for ${route.page}`
    );
    assert.ok(seo.ogImage.startsWith('https://'), `ogImage must be absolute URL for ${route.page}`);

    const graph = seo.jsonLd['@graph'] as Record<string, unknown>[];
    assert.ok(Array.isArray(graph) && graph.length >= 3, `JSON-LD @graph missing for ${route.page}`);
    assert.ok(
      graph.some((node) => node['@type'] === 'BreadcrumbList'),
      `BreadcrumbList schema missing for ${route.page}`
    );
  }
});

test('home route includes WebSite, Person, EducationalOrganization, and FAQPage schemas', () => {
  const seo = buildRouteSeo({ page: 'home' }, DEFAULT_SITE_ORIGIN);
  const graph = seo.jsonLd['@graph'] as Record<string, unknown>[];
  const types = new Set(graph.map((node) => node['@type']));
  assert.ok(types.has('Person'));
  assert.ok(types.has('EducationalOrganization'));
  assert.ok(types.has('WebSite'));
  assert.ok(types.has('FAQPage'));
});

test('blog-detail route uses article ogType and BlogPosting JSON-LD', () => {
  const seo = buildRouteSeo(
    { page: 'blog-detail', slug: BLOGS[0].slug },
    DEFAULT_SITE_ORIGIN
  );
  assert.equal(seo.ogType, 'article');
  const graph = seo.jsonLd['@graph'] as Record<string, unknown>[];
  assert.ok(graph.some((node) => node['@type'] === 'BlogPosting'));
});

test('public/robots.txt and public/sitemap.xml exist and list every public route while excluding admin', () => {
  const robotsPath = path.resolve(process.cwd(), 'public/robots.txt');
  const sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml');
  const robots = fs.readFileSync(robotsPath, 'utf8');
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');

  assert.match(robots, /User-agent:\s*\*/);
  assert.match(robots, /Disallow:\s*\/admin-dashboard/);
  assert.match(robots, /Sitemap:\s*https:\/\/.*\/sitemap\.xml/);

  const expectedPaths = getAllPublicSitemapPaths();
  assert.equal(expectedPaths.length, 18);
  for (const routePath of expectedPaths) {
    const expectedLoc = `${DEFAULT_SITE_ORIGIN}${routePath}`;
    assert.ok(
      sitemap.includes(`<loc>${expectedLoc}</loc>`),
      `sitemap.xml missing route: ${expectedLoc}`
    );
  }
  assert.equal(sitemap.includes('admin-dashboard'), false);
});
