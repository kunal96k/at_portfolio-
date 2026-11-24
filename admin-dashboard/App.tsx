import { useCallback, useEffect, useState } from 'react';
import { AdminLoginView } from './components/AdminLoginView';
import { AdminShell } from './components/AdminShell';
import { ToastViewport } from './components/ToastViewport';
import {
  INITIAL_BLOGS,
  INITIAL_COURSES,
  INITIAL_ENQUIRIES,
  INITIAL_GALLERY,
  INITIAL_MEDIA_ASSETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RESOURCES,
  INITIAL_TESTIMONIALS,
} from './data/mockAdminData';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { ModuleManagerPage } from './pages/ModuleManagerPage';
import { TopicsPage } from './topics/pages/TopicsPage';
import { SEED_TOPICS } from './topics/services/topicService';
import type {
  AdminSectionId,
  NotificationItem,
  ToastItem,
} from './types/admin';

function shouldStartOnLogin(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'login';
}

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !shouldStartOnLogin()
  );

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
  const [activeSection, setActiveSection] = useState<AdminSectionId>('overview');
  const [topicsCount, setTopicsCount] = useState<number>(SEED_TOPICS.length);

  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [gallery, setGallery] = useState(INITIAL_GALLERY);
  const [testimonials, setTestimonials] = useState(INITIAL_TESTIMONIALS);
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES);
  const [media, setMedia] = useState(INITIAL_MEDIA_ASSETS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    pushToast({ tone: 'info', title: 'All notifications marked as read' });
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setActiveSection(item.targetSection);
  };

  const handleLoginSuccess = (email: string) => {
    setIsAuthenticated(true);
    if (typeof window !== 'undefined' && window.location.search.includes('view=login')) {
      window.history.replaceState({}, '', '/admin-dashboard/');
    }
    pushToast({
      tone: 'success',
      title: 'Signed in to Admin Dashboard',
      description: `Welcome back, ${email}`,
    });
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/admin-dashboard/?view=login');
    }
  };

  const unreadEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;

  if (!isAuthenticated) {
    return <AdminLoginView onSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      <AdminShell
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onNotificationClick={handleNotificationClick}
        unreadEnquiriesCount={unreadEnquiriesCount}
        topicsCount={topicsCount}
        onSignOut={handleSignOut}
      >
        {activeSection === 'overview' && (
          <DashboardOverviewPage
            topicsCount={topicsCount}
            courses={courses}
            blogs={blogs}
            resources={resources}
            enquiries={enquiries}
            onNavigate={setActiveSection}
          />
        )}

        {activeSection === 'topics' && (
          <TopicsPage onToast={pushToast} onCountChange={setTopicsCount} />
        )}

        {activeSection !== 'overview' && activeSection !== 'topics' && (
          <ModuleManagerPage
            key={activeSection}
            section={activeSection}
            blogs={blogs}
            setBlogs={setBlogs}
            courses={courses}
            setCourses={setCourses}
            resources={resources}
            setResources={setResources}
            gallery={gallery}
            setGallery={setGallery}
            testimonials={testimonials}
            setTestimonials={setTestimonials}
            enquiries={enquiries}
            setEnquiries={setEnquiries}
            media={media}
            setMedia={setMedia}
            onToast={pushToast}
          />
        )}
      </AdminShell>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
