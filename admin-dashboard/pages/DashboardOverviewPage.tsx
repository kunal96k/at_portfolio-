import {
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  Layers,
  Mail,
} from 'lucide-react';
import { useState } from 'react';
import { MiniBarChart } from '../components/MiniBarChart';
import { StatusBadge } from '../components/StatusBadge';
import {
  MONTHLY_REPORT_ROWS,
  RECENT_ACTIVITY_FEED,
  WEEKLY_ACTIVITY_SERIES,
} from '../data/mockAdminData';
import type {
  AdminSectionId,
  BlogRecord,
  CourseRecord,
  EnquiryRecord,
  ResourceRecord,
} from '../types/admin';

interface DashboardOverviewPageProps {
  topicsCount: number;
  courses: CourseRecord[];
  blogs: BlogRecord[];
  resources: ResourceRecord[];
  enquiries: EnquiryRecord[];
  onNavigate: (section: AdminSectionId) => void;
}

export function DashboardOverviewPage({
  topicsCount,
  courses,
  blogs,
  resources,
  enquiries,
  onNavigate,
}: DashboardOverviewPageProps) {
  const [chartMetric, setChartMetric] = useState<'downloads' | 'enquiries'>(
    'downloads'
  );

  const unreadEnquiries = enquiries.filter((e) => e.status === 'New').length;
  const activeCourses = courses.filter((c) => c.status !== 'Draft').length;
  const publishedResources = resources.filter((r) => r.status === 'Published').length;

  const statCards: Array<{
    label: string;
    value: number;
    detail: string;
    icon: typeof Layers;
    target: AdminSectionId;
  }> = [
    {
      label: 'Managed Topics',
      value: topicsCount,
      detail: 'Curriculum & notes',
      icon: Layers,
      target: 'topics',
    },
    {
      label: 'Active Courses',
      value: activeCourses,
      detail: `${courses.length} total tracks`,
      icon: GraduationCap,
      target: 'courses',
    },
    {
      label: 'New Enquiries',
      value: unreadEnquiries,
      detail: `${enquiries.length} recent leads`,
      icon: Mail,
      target: 'enquiries',
    },
    {
      label: 'Study Resources',
      value: publishedResources,
      detail: 'Published PDFs',
      icon: FileText,
      target: 'resources',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Compact Stats Grid (2-col on mobile, 4-col on desktop) */}
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
                    {card.value}
                  </p>
                  <p className="mt-0.5 text-xs text-[#64748B]">{card.detail}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Chart + Recent Activity Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Weekly Engagement Bar Chart */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 lg:col-span-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0B1736]">
                Weekly Site Engagement
              </h2>
              <p className="text-xs text-[#64748B]">
                Sample 7-day breakdown of study note downloads and enquiries
              </p>
            </div>
            <div
              role="group"
              aria-label="Select chart metric"
              className="inline-flex rounded-xl bg-[#F5F7FC] p-1"
            >
              <button
                type="button"
                onClick={() => setChartMetric('downloads')}
                aria-pressed={chartMetric === 'downloads'}
                className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold transition-colors ${
                  chartMetric === 'downloads'
                    ? 'bg-white text-[#145BFF] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B1736]'
                }`}
              >
                Note Downloads
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('enquiries')}
                aria-pressed={chartMetric === 'enquiries'}
                className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold transition-colors ${
                  chartMetric === 'enquiries'
                    ? 'bg-white text-[#0B1736] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B1736]'
                }`}
              >
                Enquiries
              </button>
            </div>
          </div>

          <div className="mt-4">
            <MiniBarChart data={WEEKLY_ACTIVITY_SERIES} metric={chartMetric} />
          </div>
        </section>

        {/* Recent Activity Card */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#0B1736]">Recent Activity</h2>
            <button
              type="button"
              onClick={() => onNavigate('topics')}
              className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-[#145BFF] hover:underline"
            >
              <span>Manage Topics</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <ul className="mt-3 divide-y divide-[#E2E8F0]">
            {RECENT_ACTIVITY_FEED.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 py-3 first:pt-1 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0B1736]">
                    {item.action}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#475569]">
                    {item.target}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[#64748B] tabular-nums">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recent Enquiries, Recent Blogs & Recent Resources Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Enquiries */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#0B1736]">Recent Enquiries</h2>
            <button
              type="button"
              onClick={() => onNavigate('enquiries')}
              className="text-xs font-semibold text-[#145BFF] hover:underline"
            >
              View all
            </button>
          </div>
          <ul className="mt-3 divide-y divide-[#E2E8F0]">
            {enquiries.slice(0, 3).map((enq) => (
              <li key={enq.id} className="py-3 first:pt-1 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-[#0B1736]">
                    {enq.name}
                  </p>
                  <StatusBadge status={enq.status} />
                </div>
                <p className="mt-1 truncate text-xs text-[#475569]">
                  {enq.interest} · {enq.channel}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent Blogs */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#0B1736]">Recent Blogs</h2>
            <button
              type="button"
              onClick={() => onNavigate('blogs')}
              className="text-xs font-semibold text-[#145BFF] hover:underline"
            >
              View all
            </button>
          </div>
          <ul className="mt-3 divide-y divide-[#E2E8F0]">
            {blogs.slice(0, 3).map((blog) => (
              <li key={blog.id} className="py-3 first:pt-1 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-sm font-semibold text-[#0B1736]">
                    {blog.title}
                  </p>
                  <StatusBadge status={blog.status} />
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#64748B]">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {blog.category} · {blog.updatedAt}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent Resources */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#0B1736]">
              Recent Resources
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('resources')}
              className="text-xs font-semibold text-[#145BFF] hover:underline"
            >
              View all
            </button>
          </div>
          <ul className="mt-3 divide-y divide-[#E2E8F0]">
            {resources.slice(0, 3).map((res) => (
              <li key={res.id} className="py-3 first:pt-1 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-[#0B1736]">
                    {res.title}
                  </p>
                  <StatusBadge status={res.status} />
                </div>
                <p className="mt-1 text-xs text-[#64748B] tabular-nums">
                  {res.fileType} · {res.fileSize} · {res.downloads} downloads
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Comparison-Heavy Numerical Report: Contained Horizontal Scroll Area */}
      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0B1736]">
              Monthly Content & Enquiry Comparison (Sample Report)
            </h2>
            <p className="text-xs text-[#64748B]">
              Swipe horizontally inside this table on small screens without overflowing the page.
            </p>
          </div>
        </div>

        <div
          className="mt-4 overflow-x-auto rounded-xl border border-[#E2E8F0] admin-scroll"
          tabIndex={0}
          aria-label="Scrollable monthly metrics comparison table"
        >
          <table className="w-full min-w-[660px] border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]">
                <th className="px-4 py-3 font-semibold">Month</th>
                <th className="px-4 py-3 text-right font-semibold">Topic Views</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Note Downloads
                </th>
                <th className="px-4 py-3 text-right font-semibold">Enquiries</th>
                <th className="px-4 py-3 text-right font-semibold">Enrollments</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Avg Response
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Lab Completion
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
              {MONTHLY_REPORT_ROWS.map((row) => (
                <tr key={row.month} className="hover:bg-[#F5F7FC]/75">
                  <td className="px-4 py-3 font-semibold text-[#0B1736]">
                    {row.month}
                  </td>
                  <td className="px-4 py-3 text-right text-[#334155]">
                    {row.topicViews.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right text-[#334155]">
                    {row.noteDownloads.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right text-[#334155]">
                    {row.enquiries}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#145BFF]">
                    {row.conversions}
                  </td>
                  <td className="px-4 py-3 text-right text-[#334155]">
                    {row.avgResponseHrs} hrs
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#027A48]">
                    {row.completionRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
