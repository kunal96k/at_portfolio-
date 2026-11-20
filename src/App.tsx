/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ThemeToggle } from './components/ThemeToggle';
import { AboutPage } from './pages/AboutPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { BlogsPage } from './pages/BlogsPage';
import { GalleryPage } from './pages/GalleryPage';
import { HomePage } from './pages/HomePage';
import { ItServicesPage } from './pages/ItServicesPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { UpcomingTrainingPage } from './pages/UpcomingTrainingPage';
import { parseRoute, type AppRoute } from './utils/scrollMath';

const PAGES_WITH_CONTACT_SECTION: ReadonlySet<AppRoute['page']> = new Set([
  'home',
  'about',
  'upcoming-training',
  'it-services',
  'resources',
  'testimonials',
  'gallery',
]);

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() =>
    typeof window !== 'undefined' ? parseRoute(window.location.pathname) : { page: 'home' }
  );
  const [isDark, setIsDark] = useState(false);

  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

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
      {/* Subtle film grain texture overlay active in Dark Mode */}
      <div className="dark-grain-overlay" aria-hidden="true" />

      {/* Top Floating Morphing Navbar */}
      <Navbar route={route} onNavigate={navigate} onContactClick={scrollToContact} />

      {/* Page Router */}
      {route.page === 'home' && (
        <HomePage onNavigate={navigate} onContactClick={scrollToContact} />
      )}
      {route.page === 'about' && <AboutPage />}
      {route.page === 'projects' && <ProjectsPage onNavigate={navigate} />}
      {route.page === 'project-detail' && (
        <ProjectDetailPage slug={route.slug} onNavigate={navigate} />
      )}
      {route.page === 'blogs' && <BlogsPage onNavigate={navigate} />}
      {route.page === 'blog-detail' && <BlogDetailPage slug={route.slug} onNavigate={navigate} />}
      {route.page === 'upcoming-training' && (
        <UpcomingTrainingPage onContactClick={scrollToContact} />
      )}
      {route.page === 'it-services' && <ItServicesPage onNavigate={navigate} />}
      {route.page === 'resources' && <ResourcesPage onNavigate={navigate} />}
      {route.page === 'testimonials' && <TestimonialsPage onNavigate={navigate} />}
      {route.page === 'gallery' && <GalleryPage />}

      {/* Enhanced Brand Footer */}
      <Footer onNavigate={navigate} onContactClick={scrollToContact} />

      {/* Bottom-Center Portavia Light / Dark Theme Toggle + Subtle Desktop Cursor Dot */}
      <ThemeToggle isDark={isDark} onToggle={() => setIsDark((prev) => !prev)} />
    </div>
  );
}
