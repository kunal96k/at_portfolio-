const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080';

export const DASHBOARD_RECENT_LIMIT = 5;

export interface OverviewKpis {
  totalCourses: number;
  publishedCourses: number;
  totalBatches: number;
  upcomingBatches: number;
  totalResources: number;
  publishedResources: number;
  totalDownloads: number;
  totalBlogs: number;
  publishedBlogs: number;
  totalBlogViews: number;
  totalGallery: number;
  publishedGallery: number;
  totalTestimonials: number;
  publishedTestimonials: number;
  featuredTestimonials: number;
  totalEnquiries: number;
  newEnquiries: number;
  repliedEnquiries: number;
}

export interface DailyActivityPoint {
  isoDate: string;
  label: string;
  enquiriesCount: number;
  contentCount: number;
}

export interface ModuleSummaryRow {
  sectionKey: string;
  moduleName: string;
  liveLabel: string;
  liveCount: number;
  pendingLabel: string;
  pendingCount: number;
  totalCount: number;
  lastUpdatedAt: string | null;
}

export interface RecentActivityItem {
  id: string;
  sectionKey: string;
  moduleLabel: string;
  title: string;
  detail: string;
  status: string;
  timestamp: string;
}

export interface RecentEnquiryItem {
  id: number;
  name: string;
  channel: string;
  service: string;
  status: string;
  createdAt: string | null;
}

export interface RecentBatchItem {
  id: number;
  batchCode: string;
  title: string;
  category: string;
  batchDate: string;
  mode: string;
  status: string;
  timestamp: string | null;
}

export interface RecentBlogItem {
  id: number;
  blogCode: string;
  title: string;
  category: string;
  readTime: string;
  viewsCount: number;
  status: string;
  timestamp: string | null;
}

export interface RecentResourceItem {
  id: number;
  noteCode: string;
  title: string;
  domain: string;
  fileType: string;
  fileSizeLabel: string;
  downloads: number;
  status: string;
  timestamp: string | null;
}

export interface RecentGalleryItem {
  id: number;
  galleryCode: string;
  title: string;
  category: string;
  status: string;
  featured: boolean;
  timestamp: string | null;
}

export interface RecentTestimonialItem {
  id: number;
  testimonialCode: string;
  studentName: string;
  courseTrack: string;
  company: string;
  status: string;
  featured: boolean;
  timestamp: string | null;
}

export interface DashboardOverviewData {
  kpis: OverviewKpis;
  dailyActivity: DailyActivityPoint[];
  moduleSummaries: ModuleSummaryRow[];
  recentActivities: RecentActivityItem[];
  recentEnquiries: RecentEnquiryItem[];
  recentBatches: RecentBatchItem[];
  recentBlogs: RecentBlogItem[];
  recentResources: RecentResourceItem[];
  recentGallery: RecentGalleryItem[];
  recentTestimonials: RecentTestimonialItem[];
}

export function normalizeDashboardOverview(
  raw: DashboardOverviewData
): DashboardOverviewData {
  return {
    kpis: raw.kpis,
    dailyActivity: Array.isArray(raw.dailyActivity) ? raw.dailyActivity : [],
    moduleSummaries: Array.isArray(raw.moduleSummaries)
      ? raw.moduleSummaries
      : [],
    recentActivities: Array.isArray(raw.recentActivities)
      ? raw.recentActivities.slice(0, DASHBOARD_RECENT_LIMIT)
      : [],
    recentEnquiries: Array.isArray(raw.recentEnquiries)
      ? raw.recentEnquiries.slice(0, DASHBOARD_RECENT_LIMIT)
      : [],
    recentBatches: Array.isArray(raw.recentBatches)
      ? raw.recentBatches.slice(0, DASHBOARD_RECENT_LIMIT)
      : [],
    recentBlogs: Array.isArray(raw.recentBlogs)
      ? raw.recentBlogs.slice(0, DASHBOARD_RECENT_LIMIT)
      : [],
    recentResources: Array.isArray(raw.recentResources)
      ? raw.recentResources.slice(0, DASHBOARD_RECENT_LIMIT)
      : [],
    recentGallery: Array.isArray(raw.recentGallery)
      ? raw.recentGallery.slice(0, DASHBOARD_RECENT_LIMIT)
      : [],
    recentTestimonials: Array.isArray(raw.recentTestimonials)
      ? raw.recentTestimonials.slice(0, DASHBOARD_RECENT_LIMIT)
      : [],
  };
}

export async function fetchDashboardOverviewBackend(
  signal?: AbortSignal
): Promise<DashboardOverviewData> {
  const endpoint = `${API_BASE_URL.replace(/\/+$/, '')}/api/dashboard/overview`;
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    throw new Error(
      `Failed to load live dashboard overview (${response.status})`
    );
  }
  const json = (await response.json()) as { data?: DashboardOverviewData };
  if (!json?.data) {
    throw new Error('Dashboard overview response was empty.');
  }
  return normalizeDashboardOverview(json.data);
}
