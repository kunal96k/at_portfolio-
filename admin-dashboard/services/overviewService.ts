const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080';

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

export interface DashboardOverviewData {
  kpis: OverviewKpis;
  dailyActivity: DailyActivityPoint[];
  moduleSummaries: ModuleSummaryRow[];
  recentActivities: RecentActivityItem[];
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
    throw new Error(`Failed to load live dashboard overview (${response.status})`);
  }
  const json = (await response.json()) as { data?: DashboardOverviewData };
  if (!json?.data) {
    throw new Error('Dashboard overview response was empty.');
  }
  return json.data;
}
