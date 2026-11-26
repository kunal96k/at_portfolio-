import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarRange,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  MessageSquareQuote,
  RefreshCw,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { MiniBarChart } from '../components/MiniBarChart';
import { StatusBadge } from '../components/StatusBadge';
import {
  DASHBOARD_RECENT_LIMIT,
  fetchDashboardOverviewBackend,
  type DashboardOverviewData,
} from '../services/overviewService';
import { ENQUIRIES_UPDATED_EVENT } from '../../src/services/enquiryApi';
import { TESTIMONIALS_UPDATED_EVENT } from '../../src/services/testimonialsService';
import { formatShortDate } from '../utils/adminLogic';
import type { AdminSectionId } from '../types/admin';

interface DashboardOverviewPageProps {
  onNavigate: (section: AdminSectionId) => void;
  onOverviewLoaded?: (data: DashboardOverviewData) => void;
}

function asSectionId(key: string): AdminSectionId {
  if (
    key === 'batches' ||
    key === 'blogs' ||
    key === 'courses' ||
    key === 'resources' ||
    key === 'gallery' ||
    key === 'testimonials' ||
    key === 'enquiries'
  ) {
    return key;
  }
  return 'overview';
}

export function DashboardOverviewPage({
  onNavigate,
  onOverviewLoaded,
}: DashboardOverviewPageProps) {
  const [chartMetric, setChartMetric] = useState<
    'contentCount' | 'enquiriesCount'
  >('enquiriesCount');
  const [overview, setOverview] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDashboardOverviewBackend(signal);
        if (!signal?.aborted) {
          setOverview(data);
          onOverviewLoaded?.(data);
          setLoading(false);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!signal?.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load live database analytics.'
          );
          setLoading(false);
        }
      }
    },
    [onOverviewLoaded]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadOverview(controller.signal);

    const refresh = () => {
      void loadOverview();
    };
    window.addEventListener(ENQUIRIES_UPDATED_EVENT, refresh);
    window.addEventListener(TESTIMONIALS_UPDATED_EVENT, refresh);
    return () => {
      controller.abort();
      window.removeEventListener(ENQUIRIES_UPDATED_EVENT, refresh);
      window.removeEventListener(TESTIMONIALS_UPDATED_EVENT, refresh);
    };
  }, [loadOverview]);

  const kpis = overview?.kpis;
  const isInitialLoading = loading && !overview;

  const statCards: Array<{
    label: string;
    value: number | null;
    detail: string;
    icon: typeof CalendarRange;
    target: AdminSectionId;
  }> = [
    {
      label: 'Upcoming Batches',
      value: kpis ? kpis.upcomingBatches : null,
      detail: kpis ? `${kpis.totalBatches} total batches` : 'Syncing from DB…',
      icon: CalendarRange,
      target: 'batches',
    },
    {
      label: 'Course / Domain',
      value: kpis ? kpis.publishedCourses : null,
      detail: kpis ? `${kpis.totalCourses} total domains` : 'Syncing from DB…',
      icon: GraduationCap,
      target: 'courses',
    },
    {
      label: 'New Enquiries',
      value: kpis ? kpis.newEnquiries : null,
      detail: kpis ? `${kpis.totalEnquiries} total leads` : 'Syncing from DB…',
      icon: Mail,
      target: 'enquiries',
    },
    {
      label: 'Study Resources',
      value: kpis ? kpis.publishedResources : null,
      detail: kpis ? `${kpis.totalDownloads} total downloads` : 'Syncing from DB…',
      icon: FileText,
      target: 'resources',
    },
  ];

  const publishingCards: Array<{
    label: string;
    published: number | null;
    total: number | null;
    extra: string;
    icon: typeof BookOpen;
    target: AdminSectionId;
  }> = [
    {
      label: 'Blog Articles',
      published: kpis ? kpis.publishedBlogs : null,
      total: kpis ? kpis.totalBlogs : null,
      extra: kpis ? `${kpis.totalBlogViews} total reads` : 'Syncing from DB…',
      icon: BookOpen,
      target: 'blogs',
    },
    {
      label: 'Gallery Photos',
      published: kpis ? kpis.publishedGallery : null,
      total: kpis ? kpis.totalGallery : null,
      extra: 'Training & lab snapshots',
      icon: ImageIcon,
      target: 'gallery',
    },
    {
      label: 'Student Testimonials',
      published: kpis ? kpis.publishedTestimonials : null,
      total: kpis ? kpis.totalTestimonials : null,
      extra: kpis
        ? `${kpis.featuredTestimonials} featured on Home`
        : 'Syncing from DB…',
      icon: MessageSquareQuote,
      target: 'testimonials',
    },
  ];

  const chartData = overview?.dailyActivity ?? [];
  const recentFeed = (overview?.recentActivities ?? []).slice(
    0,
    DASHBOARD_RECENT_LIMIT
  );
  const recentEnquiries = (overview?.recentEnquiries ?? []).slice(
    0,
    DASHBOARD_RECENT_LIMIT
  );
  const recentBatches = (overview?.recentBatches ?? []).slice(
    0,
    DASHBOARD_RECENT_LIMIT
  );
  const recentBlogs = (overview?.recentBlogs ?? []).slice(
    0,
    DASHBOARD_RECENT_LIMIT
  );
  const recentResources = (overview?.recentResources ?? []).slice(
    0,
    DASHBOARD_RECENT_LIMIT
  );
  const recentGallery = (overview?.recentGallery ?? []).slice(
    0,
    DASHBOARD_RECENT_LIMIT
  );
  const recentTestimonials = (overview?.recentTestimonials ?? []).slice(
    0,
    DASHBOARD_RECENT_LIMIT
  );
  const moduleRows = overview?.moduleSummaries ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#0B1736] sm:text-2xl">
            Dashboard Overview
          </h1>
          <p className="text-xs text-[#64748B] sm:text-sm">
            Real-time MySQL database analytics and top 5 recent records per module.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadOverview()}
          disabled={loading}
          className="inline-flex h-[38px] items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#0B1736] shadow-2xs hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Data</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Live database overview unavailable</p>
            <p className="mt-0.5 text-xs text-[#B91C1C]">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadOverview()}
            className="shrink-0 rounded-lg border border-[#FCA5A5] bg-white px-3 py-1.5 text-xs font-semibold text-[#991B1B]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <section aria-label="Dashboard key metrics">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                type="button"
                onClick={() => onNavigate(card.target)}
                className="group flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition-colors hover:border-[#145BFF]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#64748B]">
                    {card.label}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#145BFF]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-[#0B1736] tabular-nums">
                    {card.value !== null ? card.value : '—'}
                  </p>
                  <p className="mt-0.5 text-xs text-[#64748B]">{card.detail}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Secondary Publishing & Social Proof Strip */}
      <section aria-label="Publishing and testimonials metrics">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
          {publishingCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                type="button"
                onClick={() => onNavigate(card.target)}
                className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3.5 text-left transition-colors hover:border-[#145BFF]"
              >
                <div>
                  <p className="text-xs font-medium text-[#64748B]">
                    {card.label}
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-[#0B1736] tabular-nums">
                    {card.published !== null ? card.published : '—'}{' '}
                    <span className="text-xs font-medium text-[#64748B]">
                      / {card.total !== null ? card.total : '—'} published
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#64748B]">
                    {card.extra}
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#145BFF]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Chart + Top 5 Recent Activity Feed */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 lg:col-span-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0B1736]">
                7-Day Live Database Activity
              </h2>
              <p className="text-xs text-[#64748B]">
                Actual daily lead submissions and content updates stored in MySQL
              </p>
            </div>
            <div
              role="group"
              aria-label="Select chart metric"
              className="inline-flex rounded-xl bg-[#F5F7FC] p-1"
            >
              <button
                type="button"
                onClick={() => setChartMetric('enquiriesCount')}
                aria-pressed={chartMetric === 'enquiriesCount'}
                className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold transition-colors ${
                  chartMetric === 'enquiriesCount'
                    ? 'bg-white text-[#0B1736] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B1736]'
                }`}
              >
                Enquiries
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('contentCount')}
                aria-pressed={chartMetric === 'contentCount'}
                className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold transition-colors ${
                  chartMetric === 'contentCount'
                    ? 'bg-white text-[#145BFF] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B1736]'
                }`}
              >
                Content Updates
              </button>
            </div>
          </div>

          <div className="mt-4">
            {isInitialLoading ? (
              <div className="h-40 animate-pulse rounded-xl bg-[#F8FAFC]" />
            ) : (
              <MiniBarChart data={chartData} metric={chartMetric} />
            )}
          </div>
        </section>

        {/* Top 5 Recent Database Activity */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0B1736]">
                Recent Activity
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Latest 5 database updates across modules
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('enquiries')}
              className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-[#145BFF] hover:underline"
            >
              <span>Manage Leads</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {isInitialLoading ? (
            <div className="mt-3 space-y-2.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="h-11 animate-pulse rounded-lg bg-[#F8FAFC]"
                />
              ))}
            </div>
          ) : recentFeed.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#64748B]">
              No database activity logged yet.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-[#E2E8F0]">
              {recentFeed.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(asSectionId(item.sectionKey))}
                    className="flex w-full items-start justify-between gap-3 py-2.5 text-left transition-colors hover:bg-[#F8FAFC] first:pt-1"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-[#EFF6FF] px-1.5 py-0.5 text-[10px] font-bold text-[#145BFF]">
                          {item.moduleLabel}
                        </span>
                        <p className="truncate text-sm font-semibold text-[#0B1736]">
                          {item.title}
                        </p>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[#475569]">
                        {item.detail}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusBadge status={item.status} />
                      <p className="mt-1 text-[10.5px] text-[#64748B] tabular-nums">
                        {formatShortDate(item.timestamp)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Top 5 Recent Database Records Grid (strictly 5 newest records per module) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Top 5 Recent Enquiries */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0B1736]">
                Recent Enquiries
              </h2>
              <p className="text-[11px] text-[#64748B]">Top 5 newest leads</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('enquiries')}
              className="text-xs font-semibold text-[#145BFF] hover:underline"
            >
              View all
            </button>
          </div>
          <ul className="mt-3 divide-y divide-[#E2E8F0]">
            {isInitialLoading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <li
                  key={n}
                  className="my-2 h-10 animate-pulse rounded-lg bg-[#F8FAFC]"
                />
              ))
            ) : recentEnquiries.length === 0 ? (
              <li className="py-4 text-xs text-[#64748B]">
                No contact enquiries recorded yet.
              </li>
            ) : (
              recentEnquiries.map((enq) => (
                <li key={enq.id} className="py-2.5 first:pt-1 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#0B1736]">
                      {enq.name}
                    </p>
                    <StatusBadge status={enq.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#475569]">
                    {enq.service || 'General Consultation'} · {enq.channel}
                    {enq.createdAt ? ` · ${formatShortDate(enq.createdAt)}` : ''}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Top 5 Recent Batches */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0B1736]">
                Recent Batches
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Top 5 recently updated batches
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('batches')}
              className="text-xs font-semibold text-[#145BFF] hover:underline"
            >
              View all
            </button>
          </div>
          <ul className="mt-3 divide-y divide-[#E2E8F0]">
            {isInitialLoading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <li
                  key={n}
                  className="my-2 h-10 animate-pulse rounded-lg bg-[#F8FAFC]"
                />
              ))
            ) : recentBatches.length === 0 ? (
              <li className="py-4 text-xs text-[#64748B]">
                No training batches found in database.
              </li>
            ) : (
              recentBatches.map((batch) => (
                <li key={batch.id} className="py-2.5 first:pt-1 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#0B1736]">
                      {batch.title}
                    </p>
                    <StatusBadge status={batch.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#64748B]">
                    {batch.category} · {batch.mode} · {batch.batchDate}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Top 5 Recent Blogs */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0B1736]">
                Recent Blogs
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Top 5 recently updated articles
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('blogs')}
              className="text-xs font-semibold text-[#145BFF] hover:underline"
            >
              View all
            </button>
          </div>
          <ul className="mt-3 divide-y divide-[#E2E8F0]">
            {isInitialLoading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <li
                  key={n}
                  className="my-2 h-10 animate-pulse rounded-lg bg-[#F8FAFC]"
                />
              ))
            ) : recentBlogs.length === 0 ? (
              <li className="py-4 text-xs text-[#64748B]">
                No blog articles found in database.
              </li>
            ) : (
              recentBlogs.map((blog) => (
                <li key={blog.id} className="py-2.5 first:pt-1 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-semibold text-[#0B1736]">
                      {blog.title}
                    </p>
                    <StatusBadge status={blog.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#64748B] tabular-nums">
                    {blog.category} · {blog.viewsCount} reads
                    {blog.timestamp
                      ? ` · ${formatShortDate(blog.timestamp)}`
                      : ''}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Top 5 Recent Resources */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0B1736]">
                Recent Resources
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Top 5 recently updated study notes
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('resources')}
              className="text-xs font-semibold text-[#145BFF] hover:underline"
            >
              View all
            </button>
          </div>
          <ul className="mt-3 divide-y divide-[#E2E8F0]">
            {isInitialLoading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <li
                  key={n}
                  className="my-2 h-10 animate-pulse rounded-lg bg-[#F8FAFC]"
                />
              ))
            ) : recentResources.length === 0 ? (
              <li className="py-4 text-xs text-[#64748B]">
                No study notes found in database.
              </li>
            ) : (
              recentResources.map((res) => (
                <li key={res.id} className="py-2.5 first:pt-1 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#0B1736]">
                      {res.title}
                    </p>
                    <StatusBadge status={res.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#64748B] tabular-nums">
                    {res.fileType}
                    {res.fileSizeLabel ? ` · ${res.fileSizeLabel}` : ''} ·{' '}
                    {res.downloads} downloads
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Top 5 Recent Gallery */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0B1736]">
                Recent Gallery
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Top 5 recently updated photos
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('gallery')}
              className="text-xs font-semibold text-[#145BFF] hover:underline"
            >
              View all
            </button>
          </div>
          <ul className="mt-3 divide-y divide-[#E2E8F0]">
            {isInitialLoading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <li
                  key={n}
                  className="my-2 h-10 animate-pulse rounded-lg bg-[#F8FAFC]"
                />
              ))
            ) : recentGallery.length === 0 ? (
              <li className="py-4 text-xs text-[#64748B]">
                No gallery photos found in database.
              </li>
            ) : (
              recentGallery.map((item) => (
                <li key={item.id} className="py-2.5 first:pt-1 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#0B1736]">
                      {item.title}
                    </p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#64748B]">
                    {item.category}
                    {item.featured ? ' · Featured' : ''}
                    {item.timestamp
                      ? ` · ${formatShortDate(item.timestamp)}`
                      : ''}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Top 5 Recent Testimonials */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0B1736]">
                Recent Testimonials
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Top 5 recently updated reviews
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('testimonials')}
              className="text-xs font-semibold text-[#145BFF] hover:underline"
            >
              View all
            </button>
          </div>
          <ul className="mt-3 divide-y divide-[#E2E8F0]">
            {isInitialLoading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <li
                  key={n}
                  className="my-2 h-10 animate-pulse rounded-lg bg-[#F8FAFC]"
                />
              ))
            ) : recentTestimonials.length === 0 ? (
              <li className="py-4 text-xs text-[#64748B]">
                No student testimonials found in database.
              </li>
            ) : (
              recentTestimonials.map((item) => (
                <li key={item.id} className="py-2.5 first:pt-1 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#0B1736]">
                      {item.studentName}
                    </p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#64748B]">
                    {item.courseTrack}
                    {item.company ? ` · ${item.company}` : ''}
                    {item.featured ? ' · Featured' : ''}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {/* Live Module Inventory Summary Table */}
      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0B1736]">
              Live Website Module Inventory Summary
            </h2>
            <p className="text-xs text-[#64748B]">
              Real-time database record counts and latest update timestamps across all 7 modules.
            </p>
          </div>
        </div>

        <div
          className="mt-4 overflow-x-auto rounded-xl border border-[#E2E8F0] admin-scroll"
          tabIndex={0}
          aria-label="Live module inventory comparison table"
        >
          <table className="w-full min-w-[640px] border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]">
                <th className="px-4 py-3 font-semibold">Module</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Active / Live
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Pending / Draft
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Total Records
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
              {moduleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-xs text-[#64748B]"
                  >
                    {isInitialLoading
                      ? 'Loading real-time module inventory…'
                      : 'No module inventory records available.'}
                  </td>
                </tr>
              ) : (
                moduleRows.map((row) => (
                  <tr
                    key={row.sectionKey}
                    onClick={() => onNavigate(asSectionId(row.sectionKey))}
                    className="cursor-pointer hover:bg-[#F5F7FC]/75"
                  >
                    <td className="px-4 py-3 font-semibold text-[#145BFF]">
                      {row.moduleName}
                    </td>
                    <td className="px-4 py-3 text-right text-[#027A48] font-semibold">
                      {row.liveCount}{' '}
                      <span className="text-[11px] font-normal text-[#64748B]">
                        ({row.liveLabel})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[#475569]">
                      {row.pendingCount}{' '}
                      <span className="text-[11px] text-[#64748B]">
                        ({row.pendingLabel})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#0B1736]">
                      {row.totalCount}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-[#64748B]">
                      {row.lastUpdatedAt
                        ? formatShortDate(row.lastUpdatedAt)
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
