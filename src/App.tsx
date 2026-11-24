/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ThemeToggle } from './components/ThemeToggle';
import { HomePage } from './pages/HomePage';
import { parseRoute, type AppRoute } from './utils/scrollMath';
import { applyRouteSeoToDocument } from './utils/seo';

const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const BlogDetailPage = lazy(() =>
  import('./pages/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage }))
);
const BlogsPage = lazy(() =>
  import('./pages/BlogsPage').then((m) => ({ default: m.BlogsPage }))
);
const GalleryPage = lazy(() =>
  import('./pages/GalleryPage').then((m) => ({ default: m.GalleryPage }))
);
const ItServicesPage = lazy(() =>
  import('./pages/ItServicesPage').then((m) => ({ default: m.ItServicesPage }))
);
const ProjectDetailPage = lazy(() =>
  import('./pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage }))
);
const ProjectsPage = lazy(() =>
  import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage }))
);
const ResourcesPage = lazy(() =>
  import('./pages/ResourcesPage').then((m) => ({ default: m.ResourcesPage }))
);
const TestimonialsPage = lazy(() =>
  import('./pages/TestimonialsPage').then((m) => ({ default: m.TestimonialsPage }))
);
const UpcomingTrainingPage = lazy(() =>
  import('./pages/UpcomingTrainingPage').then((m) => ({ default: m.UpcomingTrainingPage }))
);
const CourseDetailPage = lazy(() =>
  import('./pages/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage }))
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const PAGES_WITH_CONTACT_SECTION: ReadonlySet<AppRoute['page']> = new Set([
  'home',
  'about',
  'upcoming-training',
  'training-course',
  'contact',
  'privacy-policy',
  'it-services',
  'resources',
  'testimonials',
  'gallery',
]);

function RouteFallback() {
  return (
    <main
      id="main-content"
      className="min-h-[70vh] flex items-center justify-center px-5 pt-32 pb-20"
      aria-busy="true"
    >
      <p className="text-[15px] font-medium text-[#5C5C5C] dark:text-white/75">
        Loading content…
      </p>
    </main>
  );
}

export default function App({ initialRoute }: { initialRoute?: AppRoute } = {}) {
  const [route, setRoute] = useState<AppRoute>(() =>
    initialRoute || (typeof window !== 'undefined' ? parseRoute(window.location.pathname) : { page: 'home' })
  );
  const [isDark, setIsDark] = useState(false);

  // Ensure overall favicon is consistently /favicon.png
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = '/favicon.png';
  }, []);

  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Apply dynamic per-route SEO metadata, canonical URL, OpenGraph, Twitter Cards & Schema.org JSON-LD
  useEffect(() => {
    applyRouteSeoToDocument(route);
  }, [route]);

  // Listen to browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
      setRoute(parseRoute(path));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const scrollToContact = useCallback(() => {
    const scrollTarget = () => {
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (PAGES_WITH_CONTACT_SECTION.has(route.page)) {
      scrollTarget();
    } else {
      window.history.pushState({}, '', '/');
      setRoute({ page: 'home' });
      window.setTimeout(scrollTarget, 120);
    }
  }, [route.page]);

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#1A1A1B] text-[#303030] dark:text-white transition-colors duration-350">
      {/* Accessible Skip-to-Main-Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-[#4F58DF] focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Subtle film grain texture overlay active in Dark Mode */}
      <div className="dark-grain-overlay" aria-hidden="true" />

      {/* Top Floating Morphing Navbar */}
      <Navbar route={route} onNavigate={navigate} onContactClick={scrollToContact} />

      {/* Page Router with Route-Level Code Splitting */}
      {route.page === 'home' ? (
        <HomePage onNavigate={navigate} onContactClick={scrollToContact} />
      ) : (
        <Suspense fallback={<RouteFallback />}>
          {route.page === 'about' && <AboutPage />}
          {route.page === 'projects' && <ProjectsPage onNavigate={navigate} />}
          {route.page === 'project-detail' && (
            <ProjectDetailPage slug={route.slug} onNavigate={navigate} />
          )}
          {route.page === 'blogs' && <BlogsPage onNavigate={navigate} />}
          {route.page === 'blog-detail' && (
            <BlogDetailPage slug={route.slug} onNavigate={navigate} />
          )}
          {route.page === 'upcoming-training' && (
            <UpcomingTrainingPage onContactClick={scrollToContact} />
          )}
          {route.page === 'training-course' && (
            <CourseDetailPage
              slug={route.slug}
              onNavigate={navigate}
              onContactClick={scrollToContact}
            />
          )}
          {route.page === 'contact' && <ContactPage onNavigate={navigate} />}
          {route.page === 'privacy-policy' && <PrivacyPolicyPage onNavigate={navigate} />}
          {route.page === 'not-found' && <NotFoundPage onNavigate={navigate} />}
          {route.page === 'it-services' && <ItServicesPage onNavigate={navigate} />}
          {route.page === 'resources' && <ResourcesPage onNavigate={navigate} />}
          {route.page === 'testimonials' && <TestimonialsPage onNavigate={navigate} />}
          {route.page === 'gallery' && <GalleryPage />}
        </Suspense>
      )}

      {/* Enhanced Brand Footer */}
      <Footer onNavigate={navigate} onContactClick={scrollToContact} />

      {/* Bottom-Center Light / Dark Theme Toggle */}
      <ThemeToggle isDark={isDark} onToggle={() => setIsDark((prev) => !prev)} />
    </div>
  );
}
