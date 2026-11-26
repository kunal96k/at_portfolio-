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
import { fetchAdminBatchesPageBackend } from '../src/services/batchesService';
import {
  fetchAdminBlogsPageBackend,
  type BlogArticle,
} from '../src/services/blogsService';
import {
  fetchAllCoursesFromApiOrStorage,
  type CourseDomain,
} from '../src/services/coursesService';
import {
  ENQUIRIES_UPDATED_EVENT,
  fetchAdminEnquiriesPageBackend,
  type ContactEnquiryItem,
} from '../src/services/enquiryApi';
import { fetchAdminGalleryPageBackend } from '../src/services/galleryService';
import {
  fetchAdminResourcesPageBackend,
  type StudyResourceNote,
} from '../src/services/resourcesService';
import {
  fetchAdminTestimonialsPageBackend,
  TESTIMONIALS_UPDATED_EVENT,
} from '../src/services/testimonialsService';
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
  const [batchesCount, setBatchesCount] = useState<number>(0);

  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [blogsStats, setBlogsStats] = useState({
    total: 0,
    published: 0,
  });
  const [courses, setCourses] = useState<CourseDomain[]>([]);
  const [resourcesStats, setResourcesStats] = useState({
    total: 0,
    published: 0,
  });
  const [recentResources, setRecentResources] = useState<StudyResourceNote[]>(
    []
  );
  const [galleryStats, setGalleryStats] = useState({
    total: 0,
    published: 0,
  });
  const [testimonialsStats, setTestimonialsStats] = useState({
    total: 0,
    published: 0,
  });
  const [enquiriesStats, setEnquiriesStats] = useState({
    total: 0,
    newCount: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState<ContactEnquiryItem[]>(
    []
  );
  const [unreadEnquiriesList, setUnreadEnquiriesList] = useState<
    ContactEnquiryItem[]
  >([]);
  const [acknowledgedNotifIds, setAcknowledgedNotifIds] = useState<
    Set<string>
  >(() => new Set());
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const syncEnquiryHeaderState = useCallback(() => {
    void fetchAdminEnquiriesPageBackend({
      page: 0,
      size: 5,
      sortBy: 'createdAt',
      sortDir: 'desc',
    })
      .then((res) => {
        setEnquiriesStats({
          total: res.stats.total,
          newCount: res.stats.newCount,
        });
        setRecentEnquiries(res.items);
      })
      .catch(() => {
        // Handled cleanly in EnquiriesPage
      });

    void fetchAdminEnquiriesPageBackend({
      status: 'New',
      page: 0,
      size: 5,
      sortBy: 'createdAt',
      sortDir: 'desc',
    })
      .then((res) => {
        setUnreadEnquiriesList(res.items);
      })
      .catch(() => {
        // Offline backend handled gracefully
      });
  }, []);

  const syncTestimonialCount = useCallback(() => {
    void fetchAdminTestimonialsPageBackend({
      page: 0,
      size: 1,
      sortBy: 'displayOrder',
      sortDir: 'asc',
    })
      .then((res) => {
        setTestimonialsStats({
          total: res.stats.total,
          published: res.stats.published,
        });
      })
      .catch(() => {
        // Handled cleanly in TestimonialsPage
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchAllCoursesFromApiOrStorage().then((res) => {
      if (!cancelled) {
        setCourses(res.items);
      }
    });
    void fetchAdminResourcesPageBackend({
      page: 0,
      size: 5,
      sortBy: 'updatedAt',
      sortDir: 'desc',
    })
      .then((res) => {
        if (!cancelled) {
          setResourcesStats({
            total: res.stats.total,
            published: res.stats.published,
          });
          setRecentResources(res.items);
        }
      })
      .catch(() => {});
    void fetchAdminBatchesPageBackend({
      page: 0,
      size: 1,
      sortBy: 'updatedAt',
      sortDir: 'desc',
    })
      .then((res) => {
        if (!cancelled) {
          setBatchesCount(res.stats.total);
        }
      })
      .catch(() => {});
    void fetchAdminBlogsPageBackend({
      page: 0,
      size: 5,
      sortBy: 'updatedAt',
      sortDir: 'desc',
    })
      .then((res) => {
        if (!cancelled) {
          setBlogsStats({
            total: res.stats.total,
            published: res.stats.published,
          });
          setBlogs(res.items);
        }
      })
      .catch(() => {});
    void fetchAdminGalleryPageBackend({
      page: 0,
      size: 1,
      sortBy: 'updatedAt',
      sortDir: 'desc',
    })
      .then((res) => {
        if (!cancelled) {
          setGalleryStats({
            total: res.stats.total,
            published: res.stats.published,
          });
        }
      })
      .catch(() => {});

    syncEnquiryHeaderState();
    syncTestimonialCount();

    window.addEventListener(ENQUIRIES_UPDATED_EVENT, syncEnquiryHeaderState);
    window.addEventListener(TESTIMONIALS_UPDATED_EVENT, syncTestimonialCount);

    return () => {
      cancelled = true;
      window.removeEventListener(
        ENQUIRIES_UPDATED_EVENT,
        syncEnquiryHeaderState
      );
      window.removeEventListener(
        TESTIMONIALS_UPDATED_EVENT,
        syncTestimonialCount
      );
    };
  }, [syncEnquiryHeaderState, syncTestimonialCount]);

  const availableCourseTracks = courses.map((c) => c.title);

  const handleResourcesCountChange = useCallback(
    (total: number, published: number) => {
      setResourcesStats((prev) =>
        prev.total === total && prev.published === published
          ? prev
          : { total, published }
      );
    },
    []
  );

  const handleBlogsCountChange = useCallback(
    (total: number, published: number) => {
      setBlogsStats((prev) =>
        prev.total === total && prev.published === published
          ? prev
          : { total, published }
      );
    },
    []
  );

  const handleGalleryCountChange = useCallback(
    (total: number, published: number) => {
      setGalleryStats((prev) =>
        prev.total === total && prev.published === published
          ? prev
          : { total, published }
      );
    },
    []
  );

  const handleTestimonialsCountChange = useCallback(
    (total: number, published: number) => {
      setTestimonialsStats((prev) =>
        prev.total === total && prev.published === published
          ? prev
          : { total, published }
      );
    },
    []
  );

  const handleEnquiriesCountChange = useCallback(
    (total: number, newCount: number) => {
      setEnquiriesStats((prev) =>
        prev.total === total && prev.newCount === newCount
          ? prev
          : { total, newCount }
      );
    },
    []
  );

  const liveNotifications: NotificationItem[] = useMemo(
    () =>
      unreadEnquiriesList.map((enq) => {
        const notifId = `enquiry-notif-${enq.id}`;
        return {
          id: notifId,
          title: `New Enquiry: ${enq.name}`,
          detail: `${enq.service || 'General Consultation'} · ${enq.channel}`,
          timeAgo: enq.createdAt ? enq.createdAt.slice(0, 16) : 'Recent',
          read: acknowledgedNotifIds.has(notifId),
          targetSection: 'enquiries',
        };
      }),
    [unreadEnquiriesList, acknowledgedNotifIds]
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
    setAcknowledgedNotifIds(
      new Set(liveNotifications.map((item) => item.id))
    );
    pushToast({ tone: 'info', title: 'All notifications marked as read' });
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setAcknowledgedNotifIds((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });
    setActiveSection(item.targetSection);
  };

  const handleLoginSuccess = (email: string) => {
    setIsAuthenticated(true);
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
        notifications={liveNotifications}
        onMarkAllRead={handleMarkAllRead}
        onNotificationClick={handleNotificationClick}
        unreadEnquiriesCount={enquiriesStats.newCount}
        batchesCount={batchesCount}
        coursesCount={courses.length}
        resourcesCount={resourcesStats.total}
        blogsCount={blogsStats.total}
        galleryCount={galleryStats.total}
        testimonialsCount={testimonialsStats.total}
        onSignOut={handleSignOut}
      >
        {activeSection === 'overview' && (
          <DashboardOverviewPage
            batchesCount={batchesCount}
            courses={courses}
            blogs={blogs}
            resourcesStats={resourcesStats}
            recentResources={recentResources}
            recentEnquiries={recentEnquiries}
            unreadEnquiriesCount={enquiriesStats.newCount}
            galleryStats={galleryStats}
            testimonialsStats={testimonialsStats}
            onNavigate={setActiveSection}
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
          <CoursesPage onToast={pushToast} onCoursesChange={setCourses} />
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
            onBlogsChange={setBlogs}
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
