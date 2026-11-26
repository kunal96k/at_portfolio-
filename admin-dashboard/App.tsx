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
  ADMIN_SESSION_EXPIRED_EVENT,
  fetchAdminSessionBackend,
  logoutAdminBackend,
  type AdminSessionState,
} from '../src/services/authService';
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

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

function shouldForceLoginView(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'login';
}

export default function AdminApp() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [sessionState, setSessionState] = useState<AdminSessionState | null>(
    null
  );
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

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

  // Verify live backend HttpOnly session on mount (no client-side bypass)
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    void fetchAdminSessionBackend(controller.signal)
      .then((session) => {
        if (!active) return;
        if (session.authenticated && session.user && !shouldForceLoginView()) {
          setSessionState(session);
          setSessionNotice(null);
          setAuthStatus('authenticated');
        } else {
          setSessionState(session.authenticated ? session : null);
          setAuthStatus('unauthenticated');
        }
      })
      .catch((err) => {
        if (!active || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        setSessionState(null);
        setAuthStatus('unauthenticated');
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  // Global listener for 401 session expiry across any admin service call
  useEffect(() => {
    const handleSessionExpired = () => {
      setSessionState(null);
      setSessionNotice(
        'Your admin session expired or reached the 10 concurrent session limit. Please sign in again.'
      );
      setAuthStatus('unauthenticated');
    };
    window.addEventListener(
      ADMIN_SESSION_EXPIRED_EVENT,
      handleSessionExpired
    );
    return () => {
      window.removeEventListener(
        ADMIN_SESSION_EXPIRED_EVENT,
        handleSessionExpired
      );
    };
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
        // Session/offline handled gracefully by adminFetch & view states
      });
  }, []);

  const syncSidebarCountsFromBackend = useCallback(() => {
    void fetchDashboardOverviewBackend()
      .then(applyOverviewSidebarStats)
      .catch(() => {
        // Offline / session expiry surfaced cleanly
      });
  }, [applyOverviewSidebarStats]);

  // Only load protected admin API data once backend session is confirmed
  useEffect(() => {
    if (authStatus !== 'authenticated') return;

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
  }, [authStatus, syncSidebarCountsFromBackend, syncEnquiryHeaderNotifications]);

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

  const handleLoginSuccess = (session: AdminSessionState) => {
    setSessionState(session);
    setSessionNotice(null);
    setAuthStatus('authenticated');
    if (
      typeof window !== 'undefined' &&
      window.location.search.includes('view=login')
    ) {
      window.history.replaceState({}, '', '/admin-dashboard/');
    }
    const label = session.user?.name || session.user?.email || session.user?.username || 'Admin';
    pushToast({
      tone: 'success',
      title: 'Signed in to Admin Dashboard',
      description: `Welcome back, ${label} (Session ${session.activeSessions}/${session.maxSessions})`,
    });
  };

  const handleSignOut = () => {
    void logoutAdminBackend().finally(() => {
      setSessionState(null);
      setSessionNotice('You have signed out cleanly.');
      setAuthStatus('unauthenticated');
      setUnreadEnquiriesList([]);
      setUnreadEnquiriesCount(0);
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/admin-dashboard/?view=login');
      }
    });
  };

  if (authStatus === 'checking') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7FC] px-4 text-[#0B1736]">
        <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#145BFF] border-t-transparent" />
          <span className="text-sm font-semibold text-[#0B1736]">
            Verifying administrator session…
          </span>
        </div>
      </div>
    );
  }

  if (authStatus !== 'authenticated') {
    return (
      <AdminLoginView
        onSuccess={handleLoginSuccess}
        sessionNotice={sessionNotice}
      />
    );
  }

  return (
    <>
      <AdminShell
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        adminName={sessionState?.user?.name}
        adminUsername={sessionState?.user?.username}
        adminEmail={sessionState?.user?.email}
        activeSessions={sessionState?.activeSessions}
        maxSessions={sessionState?.maxSessions}
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
