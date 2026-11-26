import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminLoginView } from './components/AdminLoginView';
import { AdminShell } from './components/AdminShell';
import { ToastViewport } from './components/ToastViewport';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { BatchesPage } from './batches/pages/BatchesPage';
import { BlogsPage } from './blogs/pages/BlogsPage';
import { CoursesPage } from './courses/pages/CoursesPage';
import { EnquiriesPage } from './enquiries/pages/EnquiriesPage';
import { GalleryPage } from './gallery/pages/GalleryPage';
import { ResourcesPage } from './resources/pages/ResourcesPage';
import { TestimonialsPage } from './testimonials/pages/TestimonialsPage';
import {
  fetchDashboardOverviewBackend,
  type DashboardOverviewData,
} from './services/overviewService';
import {
  fetchAllCoursesBackend,
  type CourseDomain,
} from '../src/services/coursesService';
import {
  ENQUIRIES_UPDATED_EVENT,
  fetchUnreadNotificationsBackend,
  markAllNewEnquiriesReadBackend,
  NOTIFICATION_LIMIT,
  updateEnquiryStatusBackend,
  type ContactEnquiryItem,
} from '../src/services/enquiryApi';
import { TESTIMONIALS_UPDATED_EVENT } from '../src/services/testimonialsService';
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
  const [adminEmail, setAdminEmail] = useState<string>('');

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
  const [batchesCount, setBatchesCount] = useState<number>(0);
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [courses, setCourses] = useState<CourseDomain[]>([]);
  const [resourcesCount, setResourcesCount] = useState<number>(0);
  const [blogsCount, setBlogsCount] = useState<number>(0);
  const [galleryCount, setGalleryCount] = useState<number>(0);
  const [testimonialsCount, setTestimonialsCount] = useState<number>(0);
  const [unreadEnquiriesCount, setUnreadEnquiriesCount] = useState<number>(0);
  const [unreadEnquiriesList, setUnreadEnquiriesList] = useState<
    ContactEnquiryItem[]
  >([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const applyOverviewSidebarStats = useCallback(
    (data: DashboardOverviewData) => {
      setBatchesCount(data.kpis.totalBatches);
      setCoursesCount(data.kpis.totalCourses);
      setResourcesCount(data.kpis.totalResources);
      setBlogsCount(data.kpis.totalBlogs);
      setGalleryCount(data.kpis.totalGallery);
      setTestimonialsCount(data.kpis.totalTestimonials);
      setUnreadEnquiriesCount(data.kpis.newEnquiries);
    },
    []
  );

  const syncEnquiryHeaderNotifications = useCallback(() => {
    void fetchUnreadNotificationsBackend(NOTIFICATION_LIMIT)
      .then((res) => {
        setUnreadEnquiriesCount(res.totalUnread);
        setUnreadEnquiriesList(res.items.slice(0, NOTIFICATION_LIMIT));
      })
      .catch(() => {
        // Offline backend handled cleanly
      });
  }, []);

  const syncSidebarCountsFromBackend = useCallback(() => {
    void fetchDashboardOverviewBackend()
      .then(applyOverviewSidebarStats)
      .catch(() => {
        // Offline backend surfaced cleanly inside active modules
      });
  }, [applyOverviewSidebarStats]);

  useEffect(() => {
    let cancelled = false;
    void fetchAllCoursesBackend()
      .then((items) => {
        if (!cancelled) {
          setCourses(items);
          setCoursesCount(items.length);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCourses([]);
        }
      });

    syncSidebarCountsFromBackend();
    syncEnquiryHeaderNotifications();

    const handleGlobalRefresh = () => {
      syncSidebarCountsFromBackend();
      syncEnquiryHeaderNotifications();
    };
    window.addEventListener(ENQUIRIES_UPDATED_EVENT, handleGlobalRefresh);
    window.addEventListener(TESTIMONIALS_UPDATED_EVENT, handleGlobalRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener(
        ENQUIRIES_UPDATED_EVENT,
        handleGlobalRefresh
      );
      window.removeEventListener(
        TESTIMONIALS_UPDATED_EVENT,
        handleGlobalRefresh
      );
    };
  }, [syncSidebarCountsFromBackend, syncEnquiryHeaderNotifications]);

  const availableCourseTracks = useMemo(
    () => courses.map((c) => c.title),
    [courses]
  );

  const handleCoursesChange = useCallback((nextCourses: CourseDomain[]) => {
    setCourses(nextCourses);
    setCoursesCount(nextCourses.length);
  }, []);

  const handleResourcesCountChange = useCallback((total: number) => {
    setResourcesCount(total);
  }, []);

  const handleBlogsCountChange = useCallback((total: number) => {
    setBlogsCount(total);
  }, []);

  const handleGalleryCountChange = useCallback((total: number) => {
    setGalleryCount(total);
  }, []);

  const handleTestimonialsCountChange = useCallback((total: number) => {
    setTestimonialsCount(total);
  }, []);

  const handleEnquiriesCountChange = useCallback(
    (_total: number, newCount: number) => {
      setUnreadEnquiriesCount(newCount);
    },
    []
  );

  const liveNotifications: NotificationItem[] = useMemo(
    () =>
      unreadEnquiriesList
        .filter((enq) => enq.status === 'New')
        .slice(0, NOTIFICATION_LIMIT)
        .map((enq) => ({
          id: `enquiry-notif-${enq.id}`,
          title: `New Enquiry: ${enq.name}`,
          detail: `${enq.service || 'General Consultation'} · ${enq.channel}`,
          timeAgo: enq.createdAt ? enq.createdAt.slice(0, 16) : 'Recent',
          read: false,
          targetSection: 'enquiries',
        })),
    [unreadEnquiriesList]
  );

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
    if (unreadEnquiriesList.length === 0 && unreadEnquiriesCount === 0) {
      return;
    }
    setUnreadEnquiriesList([]);
    setUnreadEnquiriesCount(0);
    void markAllNewEnquiriesReadBackend()
      .then(() => {
        pushToast({ tone: 'info', title: 'All notifications marked as read' });
      })
      .catch((err) => {
        syncEnquiryHeaderNotifications();
        pushToast({
          tone: 'error',
          title: 'Could not mark notifications read',
          description: err instanceof Error ? err.message : undefined,
        });
      });
  };

  const handleNotificationClick = (item: NotificationItem) => {
    const enquiryId = item.id.replace(/^enquiry-notif-/, '');
    setUnreadEnquiriesList((prev) =>
      prev.filter((enq) => enq.id !== enquiryId)
    );
    setUnreadEnquiriesCount((prev) => Math.max(0, prev - 1));
    setActiveSection(item.targetSection);
    if (enquiryId) {
      void updateEnquiryStatusBackend(enquiryId, 'Read').catch(() => {
        syncEnquiryHeaderNotifications();
      });
    }
  };

  const handleLoginSuccess = (email: string) => {
    setIsAuthenticated(true);
    setAdminEmail(email);
    if (
      typeof window !== 'undefined' &&
      window.location.search.includes('view=login')
    ) {
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
    setAdminEmail('');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/admin-dashboard/?view=login');
    }
  };

  if (!isAuthenticated) {
    return <AdminLoginView onSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      <AdminShell
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        adminEmail={adminEmail || undefined}
        notifications={liveNotifications}
        onMarkAllRead={handleMarkAllRead}
        onNotificationClick={handleNotificationClick}
        unreadEnquiriesCount={unreadEnquiriesCount}
        batchesCount={batchesCount}
        coursesCount={coursesCount}
        resourcesCount={resourcesCount}
        blogsCount={blogsCount}
        galleryCount={galleryCount}
        testimonialsCount={testimonialsCount}
        onSignOut={handleSignOut}
      >
        {activeSection === 'overview' && (
          <DashboardOverviewPage
            onNavigate={setActiveSection}
            onOverviewLoaded={applyOverviewSidebarStats}
          />
        )}

        {activeSection === 'batches' && (
          <BatchesPage
            onToast={pushToast}
            onCountChange={setBatchesCount}
            availableCourseTracks={availableCourseTracks}
          />
        )}

        {activeSection === 'courses' && (
          <CoursesPage
            onToast={pushToast}
            onCoursesChange={handleCoursesChange}
          />
        )}

        {activeSection === 'resources' && (
          <ResourcesPage
            onToast={pushToast}
            domainSuggestions={availableCourseTracks}
            onCountChange={handleResourcesCountChange}
          />
        )}

        {activeSection === 'blogs' && (
          <BlogsPage
            onToast={pushToast}
            domainSuggestions={availableCourseTracks}
            onCountChange={handleBlogsCountChange}
          />
        )}

        {activeSection === 'gallery' && (
          <GalleryPage
            onToast={pushToast}
            onCountChange={handleGalleryCountChange}
          />
        )}

        {activeSection === 'enquiries' && (
          <EnquiriesPage
            onToast={pushToast}
            domainSuggestions={availableCourseTracks}
            onCountChange={handleEnquiriesCountChange}
          />
        )}

        {activeSection === 'testimonials' && (
          <TestimonialsPage
            onToast={pushToast}
            domainSuggestions={availableCourseTracks}
            onCountChange={handleTestimonialsCountChange}
          />
        )}
      </AdminShell>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
