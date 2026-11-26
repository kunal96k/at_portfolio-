import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DASHBOARD_RECENT_LIMIT,
  fetchDashboardOverviewBackend,
  normalizeDashboardOverview,
  type DashboardOverviewData,
} from './overviewService';

function buildDummyOverviewPayload(countPerList: number): DashboardOverviewData {
  const makeItems = <T>(factory: (i: number) => T): T[] =>
    Array.from({ length: countPerList }, (_, idx) => factory(idx + 1));

  return {
    kpis: {
      totalCourses: 5,
      publishedCourses: 5,
      totalBatches: countPerList,
      upcomingBatches: 4,
      totalResources: countPerList,
      publishedResources: 6,
      totalDownloads: 120,
      totalBlogs: countPerList,
      publishedBlogs: 5,
      totalBlogViews: 340,
      totalGallery: countPerList,
      publishedGallery: 6,
      totalTestimonials: countPerList,
      publishedTestimonials: 5,
      featuredTestimonials: 2,
      totalEnquiries: countPerList,
      newEnquiries: 3,
      repliedEnquiries: 4,
    },
    dailyActivity: [
      {
        isoDate: '2026-11-26',
        label: '26 Nov',
        enquiriesCount: 2,
        contentCount: 3,
      },
    ],
    moduleSummaries: [],
    recentActivities: makeItems((i) => ({
      id: `act-${i}`,
      sectionKey: 'enquiries',
      moduleLabel: 'Enquiry',
      title: `Activity ${i}`,
      detail: 'Linux Training',
      status: 'New',
      timestamp: '2026-11-26 10:00:00',
    })),
    recentEnquiries: makeItems((i) => ({
      id: i,
      name: `Lead ${i}`,
      channel: 'Contact Form',
      service: 'Red Hat Linux',
      status: 'New',
      createdAt: '2026-11-26 10:00:00',
    })),
    recentBatches: makeItems((i) => ({
      id: i,
      batchCode: `BATCH-00${i}`,
      title: `Batch ${i}`,
      category: 'Linux',
      batchDate: '2026-12-01',
      mode: 'Online Live',
      status: 'Published',
      timestamp: '2026-11-26 10:00:00',
    })),
    recentBlogs: makeItems((i) => ({
      id: i,
      blogCode: `BLOG-00${i}`,
      title: `Blog ${i}`,
      category: 'Linux',
      readTime: '5 min',
      viewsCount: 15,
      status: 'Published',
      timestamp: '2026-11-26 10:00:00',
    })),
    recentResources: makeItems((i) => ({
      id: i,
      noteCode: `NOTE-00${i}`,
      title: `Note ${i}`,
      domain: 'Linux',
      fileType: 'PDF',
      fileSizeLabel: '1.2 MB',
      downloads: 8,
      status: 'Published',
      timestamp: '2026-11-26 10:00:00',
    })),
    recentGallery: makeItems((i) => ({
      id: i,
      galleryCode: `GAL-00${i}`,
      title: `Gallery ${i}`,
      category: 'Lab Sessions',
      status: 'Published',
      featured: false,
      timestamp: '2026-11-26 10:00:00',
    })),
    recentTestimonials: makeItems((i) => ({
      id: i,
      testimonialCode: `TEST-00${i}`,
      studentName: `Student ${i}`,
      courseTrack: 'Linux',
      company: 'TechCorp',
      status: 'Published',
      featured: false,
      timestamp: '2026-11-26 10:00:00',
    })),
  };
}

test('normalizeDashboardOverview strictly clamps every recent list to top 5', () => {
  const normalized = normalizeDashboardOverview(buildDummyOverviewPayload(9));

  assert.equal(normalized.recentActivities.length, DASHBOARD_RECENT_LIMIT);
  assert.equal(normalized.recentEnquiries.length, DASHBOARD_RECENT_LIMIT);
  assert.equal(normalized.recentBatches.length, DASHBOARD_RECENT_LIMIT);
  assert.equal(normalized.recentBlogs.length, DASHBOARD_RECENT_LIMIT);
  assert.equal(normalized.recentResources.length, DASHBOARD_RECENT_LIMIT);
  assert.equal(normalized.recentGallery.length, DASHBOARD_RECENT_LIMIT);
  assert.equal(normalized.recentTestimonials.length, DASHBOARD_RECENT_LIMIT);
  assert.equal(normalized.recentEnquiries[0].name, 'Lead 1');
  assert.equal(normalized.recentEnquiries[4].name, 'Lead 5');
});

test('fetchDashboardOverviewBackend throws clean error when backend fails or returns empty', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({}), { status: 500 });
    await assert.rejects(
      fetchDashboardOverviewBackend(),
      /Failed to load live dashboard overview \(500\)/
    );

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ data: buildDummyOverviewPayload(8) }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    const loaded = await fetchDashboardOverviewBackend();
    assert.equal(loaded.recentEnquiries.length, 5);
    assert.equal(loaded.recentBlogs.length, 5);
    assert.equal(loaded.recentBatches.length, 5);
    assert.equal(loaded.recentResources.length, 5);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
