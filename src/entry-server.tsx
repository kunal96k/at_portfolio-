import { renderToString } from 'react-dom/server';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { UpcomingTrainingPage } from './pages/UpcomingTrainingPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { BlogsPage } from './pages/BlogsPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ItServicesPage } from './pages/ItServicesPage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ThemeToggle } from './components/ThemeToggle';
import { parseRoute, type AppRoute } from './utils/scrollMath';
import { buildRouteSeo, type RouteSeoMetadata } from './utils/seo';
import { SITE_URL } from './config/site';

function ServerApp({ route }: { route: AppRoute }) {
  const noop = () => {};

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#1A1A1B] text-[#303030] dark:text-white transition-colors duration-350">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-[#4F58DF] focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      <div className="dark-grain-overlay" aria-hidden="true" />
      <Navbar route={route} onNavigate={noop} onContactClick={noop} />

      {route.page === 'home' && <HomePage onNavigate={noop} onContactClick={noop} />}
      {route.page === 'about' && <AboutPage />}
      {route.page === 'upcoming-training' && <UpcomingTrainingPage onContactClick={noop} />}
      {route.page === 'training-course' && (
        <CourseDetailPage slug={route.slug} onNavigate={noop} onContactClick={noop} />
      )}
      {route.page === 'contact' && <ContactPage onNavigate={noop} />}
      {route.page === 'privacy-policy' && <PrivacyPolicyPage onNavigate={noop} />}
      {route.page === 'resources' && <ResourcesPage onNavigate={noop} />}
      {route.page === 'testimonials' && <TestimonialsPage onNavigate={noop} />}
      {route.page === 'gallery' && <GalleryPage />}
      {route.page === 'blogs' && <BlogsPage onNavigate={noop} />}
      {route.page === 'blog-detail' && <BlogDetailPage slug={route.slug} onNavigate={noop} />}
      {route.page === 'projects' && <ProjectsPage onNavigate={noop} />}
      {route.page === 'project-detail' && <ProjectDetailPage slug={route.slug} onNavigate={noop} />}
      {route.page === 'it-services' && <ItServicesPage onNavigate={noop} />}
      {route.page === 'not-found' && <NotFoundPage onNavigate={noop} />}

      <Footer onNavigate={noop} onContactClick={noop} />
      <ThemeToggle isDark={false} onToggle={noop} />
    </div>
  );
}

export function render(url: string): { html: string; seo: RouteSeoMetadata; route: AppRoute } {
  const route = parseRoute(url);
  const html = renderToString(<ServerApp route={route} />);
  const seo = buildRouteSeo(route, SITE_URL);
  return { html, seo, route };
}
