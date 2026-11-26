import {
  Bell,
  BookOpen,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  MoreHorizontal,
  PenSquare,
  User,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { PROFILE } from '../../src/data/portfolioData';
import type { AdminSectionId, NotificationItem } from '../types/admin';
import {
  ALL_SIDEBAR_GROUP_IDS,
  findSidebarGroupForSection,
  getSidebarShellLayout,
  toggleSidebarGroup,
  type SidebarGroupDef,
  type SidebarGroupId,
} from '../utils/adminLogic';
import { MobileModalShell } from './MobileModalShell';

export interface NavItemConfig {
  id: AdminSectionId;
  label: string;
  shortLabel: string;
  description: string;
  group: 'main' | SidebarGroupId;
  keywords: string[];
  icon: typeof LayoutDashboard;
  badgeCount?: number;
  highlightBadge?: boolean;
}

interface SidebarGroupMeta {
  id: SidebarGroupId;
  label: string;
  icon: typeof LayoutDashboard;
}

interface AdminShellProps {
  activeSection: AdminSectionId;
  onSelectSection: (section: AdminSectionId) => void;
  adminName?: string;
  adminUsername?: string;
  adminEmail?: string;
  activeSessions?: number;
  maxSessions?: number;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onNotificationClick: (item: NotificationItem) => void;
  unreadEnquiriesCount: number;
  batchesCount: number;
  coursesCount?: number;
  resourcesCount?: number;
  blogsCount?: number;
  galleryCount?: number;
  testimonialsCount?: number;
  onSignOut?: () => void;
  children: ReactNode;
}

const SIDEBAR_GROUPS_META: SidebarGroupMeta[] = [
  { id: 'curriculum', label: 'Curriculum', icon: GraduationCap },
  { id: 'publishing', label: 'Publishing', icon: PenSquare },
  { id: 'engagement', label: 'Engagement', icon: Users },
];

const PRIMARY_BOTTOM_TABS: AdminSectionId[] = [
  'overview',
  'batches',
  'courses',
  'enquiries',
];

const MORE_SHEET_SECTIONS: AdminSectionId[] = [
  'blogs',
  'resources',
  'gallery',
  'testimonials',
];

export function AdminShell({
  activeSection,
  onSelectSection,
  adminName,
  adminUsername,
  adminEmail,
  activeSessions,
  maxSessions,
  notifications,
  onMarkAllRead,
  onNotificationClick,
  unreadEnquiriesCount,
  batchesCount,
  coursesCount,
  resourcesCount,
  blogsCount,
  galleryCount,
  testimonialsCount,
  onSignOut,
  children,
}: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<SidebarGroupId[]>(() => [
    ...ALL_SIDEBAR_GROUP_IDS,
  ]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [drawerOpen]);

  const navItems: NavItemConfig[] = useMemo(
    () => [
      {
        id: 'overview',
        label: 'Overview',
        shortLabel: 'Overview',
        description: 'Key metrics, weekly activity, and monthly report',
        group: 'main',
        keywords: ['dashboard', 'analytics', 'stats', 'home'],
        icon: LayoutDashboard,
      },
      {
        id: 'batches',
        label: 'Batches',
        shortLabel: 'Batches',
        description: 'Manage upcoming batches, schedules, mode, and brochures',
        group: 'curriculum',
        keywords: ['batches', 'schedules', 'upcoming', 'classes', 'linux', 'cisco', 'aws'],
        icon: CalendarRange,
        badgeCount: batchesCount,
      },
      {
        id: 'courses',
        label: 'Course / Domain',
        shortLabel: 'Domains',
        description: 'Manage website core domains, syllabus tracks, and PDFs',
        group: 'curriculum',
        keywords: ['course', 'domain', 'training', 'syllabus', 'tracks', 'curriculum'],
        icon: GraduationCap,
        badgeCount: coursesCount,
      },
      {
        id: 'resources',
        label: 'Resources & Notes',
        shortLabel: 'Resources',
        description: 'Downloadable study PDFs, notes, and lab manuals',
        group: 'curriculum',
        keywords: ['pdfs', 'notes', 'downloads', 'manuals'],
        icon: FileText,
        badgeCount: resourcesCount,
      },
      {
        id: 'blogs',
        label: 'Blogs',
        shortLabel: 'Blogs',
        description: 'Drafts, published articles, and featured guides',
        group: 'publishing',
        keywords: ['articles', 'posts', 'guides', 'writing'],
        icon: BookOpen,
        badgeCount: blogsCount,
      },
      {
        id: 'gallery',
        label: 'Gallery',
        shortLabel: 'Gallery',
        description: 'Lab sessions, network racks, and workshop photos',
        group: 'publishing',
        keywords: ['photos', 'images', 'events', 'workshops'],
        icon: ImageIcon,
        badgeCount: galleryCount,
      },
      {
        id: 'enquiries',
        label: 'Enquiries',
        shortLabel: 'Enquiries',
        description: 'Incoming training leads and consultation requests',
        group: 'engagement',
        keywords: ['leads', 'messages', 'contact', 'inbox'],
        icon: Mail,
        badgeCount: unreadEnquiriesCount > 0 ? unreadEnquiriesCount : undefined,
        highlightBadge: unreadEnquiriesCount > 0,
      },
      {
        id: 'testimonials',
        label: 'Testimonials',
        shortLabel: 'Reviews',
        description: 'Placed student feedback and verified stories',
        group: 'engagement',
        keywords: ['reviews', 'students', 'feedback', 'placements'],
        icon: MessageSquareQuote,
        badgeCount: testimonialsCount,
      },
    ],
    [batchesCount, coursesCount, resourcesCount, blogsCount, galleryCount, testimonialsCount, unreadEnquiriesCount]
  );

  const sidebarGroups: SidebarGroupDef<NavItemConfig>[] = useMemo(
    () =>
      SIDEBAR_GROUPS_META.map((meta) => ({
        id: meta.id,
        label: meta.label,
        items: navItems.filter((item) => item.group === meta.id),
      })),
    [navItems]
  );

  const activeItem =
    navItems.find((item) => item.id === activeSection) ?? navItems[0];
  const activeGroup = useMemo(
    () => findSidebarGroupForSection(sidebarGroups, activeSection),
    [sidebarGroups, activeSection]
  );

  const overviewItem = navItems[0];
  const shellLayout = getSidebarShellLayout(sidebarCollapsed);
  const unreadNotifications = notifications.filter((n) => !n.read).slice(0, 5);
  const unreadNotifCount = unreadNotifications.length;
  const isMoreSectionActive = MORE_SHEET_SECTIONS.includes(activeSection);

  const handleNavigate = (section: AdminSectionId) => {
    onSelectSection(section);
    setDrawerOpen(false);
    setMoreSheetOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleGroup = (groupId: SidebarGroupId) => {
    setExpandedGroups((prev) => toggleSidebarGroup(prev, groupId));
  };

  const renderSidebarLinks = (isMobileDrawer = false, isCollapsed = false) => {
    const rowHeight = isMobileDrawer ? 'min-h-[38px]' : 'h-[32px]';
    const groupHeight = isMobileDrawer ? 'min-h-[38px]' : 'h-[32px]';
    const OverviewIcon = overviewItem.icon;
    const isOverviewActive = activeSection === overviewItem.id;

    if (isCollapsed) {
      return (
        <div className="flex min-h-0 flex-1 flex-col">
          <nav
            aria-label="Collapsed sidebar icons"
            className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-2 pt-3 pb-4 admin-scroll"
          >
            {/* Overview Icon Only */}
            <button
              type="button"
              onClick={() => handleNavigate(overviewItem.id)}
              aria-label={overviewItem.label}
              title={overviewItem.label}
              aria-current={isOverviewActive ? 'page' : undefined}
              className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isOverviewActive
                ? 'bg-[#145BFF]/24 text-[#60A5FA] ring-1 ring-inset ring-[#60A5FA]/35'
                : 'text-white/65 hover:bg-white/[0.07] hover:text-white'
                }`}
            >
              <OverviewIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>

            {/* Module Icons Only (grouped by subtle divider) */}
            {sidebarGroups.map((group) => (
              <div
                key={group.id}
                className="space-y-1.5 border-t border-white/[0.08] pt-2"
              >
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  const tooltip =
                    item.badgeCount !== undefined
                      ? `${item.label} (${item.badgeCount})`
                      : item.label;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      aria-label={tooltip}
                      title={tooltip}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isActive
                        ? 'bg-[#145BFF]/24 text-[#60A5FA] ring-1 ring-inset ring-[#60A5FA]/35'
                        : 'text-white/65 hover:bg-white/[0.07] hover:text-white'
                        }`}
                    >
                      <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
                      {item.highlightBadge && (
                        <span
                          aria-hidden="true"
                          className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#60A5FA]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      );
    }

    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Scrollable Navigation Tree */}
        <nav
          aria-label={isMobileDrawer ? 'Mobile sidebar sections' : 'Sidebar sections'}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain touch-pan-y px-3 pt-3 pb-4 admin-scroll"
        >
          {/* Pinned Overview Row */}
          <button
            type="button"
            onClick={() => handleNavigate(overviewItem.id)}
            aria-current={isOverviewActive ? 'page' : undefined}
            className={`group flex ${isMobileDrawer ? 'min-h-[40px]' : 'h-[34px]'} w-full items-center justify-between gap-2 rounded-lg px-2.5 text-[12.5px] font-medium transition-colors ${isOverviewActive
              ? 'bg-[#145BFF]/22 text-white ring-1 ring-inset ring-[#60A5FA]/30'
              : 'text-white/75 hover:bg-white/[0.06] hover:text-white'
              }`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <OverviewIcon
                className={`h-[15px] w-[15px] shrink-0 transition-colors ${isOverviewActive
                  ? 'text-[#60A5FA]'
                  : 'text-white/50 group-hover:text-white/80'
                  }`}
                aria-hidden="true"
              />
              <span className="truncate">{overviewItem.label}</span>
            </span>
          </button>

          {/* Modules Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-white/38">
              Modules
            </span>
          </div>

          {/* Collapsible Dropdown Groups */}
          <div className="space-y-1">
            {sidebarGroups.map((group) => {
              const meta = SIDEBAR_GROUPS_META.find((m) => m.id === group.id)!;
              const GroupIcon = meta.icon;
              const isExpanded = expandedGroups.includes(group.id);
              const hasActiveChild = group.items.some(
                (item) => item.id === activeSection
              );
              const groupAlertCount = group.items.reduce(
                (sum, item) =>
                  sum + (item.highlightBadge && item.badgeCount ? item.badgeCount : 0),
                0
              );

              return (
                <div key={group.id}>
                  <button
                    type="button"
                    onClick={() => handleToggleGroup(group.id)}
                    aria-expanded={isExpanded}
                    className={`group flex ${groupHeight} w-full items-center justify-between gap-2 rounded-lg px-2.5 text-[12px] font-medium transition-colors ${hasActiveChild && !isExpanded
                      ? 'bg-white/[0.07] text-white'
                      : 'text-white/75 hover:bg-white/[0.05] hover:text-white'
                      }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <GroupIcon
                        className={`h-[14px] w-[14px] shrink-0 transition-colors ${hasActiveChild
                          ? 'text-[#60A5FA]'
                          : 'text-white/45 group-hover:text-white/75'
                          }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{group.label}</span>
                    </span>

                    <span className="flex shrink-0 items-center gap-1.5">
                      {!isExpanded && groupAlertCount > 0 && (
                        <span className="text-[10.5px] font-semibold tabular-nums text-[#60A5FA]">
                          {groupAlertCount}
                        </span>
                      )}
                      <ChevronRight
                        className={`h-3.5 w-3.5 text-white/40 transition-transform duration-150 group-hover:text-white/70 ${isExpanded ? 'rotate-90 text-white/65' : ''
                          }`}
                        aria-hidden="true"
                      />
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-0.5 ml-[17px] space-y-0.5 border-l border-white/[0.09] pl-2.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNavigate(item.id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`group flex ${rowHeight} w-full items-center justify-between gap-2 rounded-lg px-2.5 text-[12px] transition-colors ${isActive
                              ? 'bg-[#145BFF]/22 font-medium text-white ring-1 ring-inset ring-[#60A5FA]/30'
                              : 'font-normal text-white/68 hover:bg-white/[0.05] hover:text-white'
                              }`}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <Icon
                                className={`h-[14px] w-[14px] shrink-0 transition-colors ${isActive
                                  ? 'text-[#60A5FA]'
                                  : 'text-white/40 group-hover:text-white/75'
                                  }`}
                                aria-hidden="true"
                              />
                              <span className="truncate">{item.label}</span>
                            </span>

                            {item.badgeCount !== undefined && (
                              <span
                                className={`shrink-0 text-[10.5px] font-medium tabular-nums ${item.highlightBadge
                                  ? 'text-[#93C5FD]'
                                  : isActive
                                    ? 'text-white/85'
                                    : 'text-white/42'
                                  }`}
                              >
                                {item.badgeCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FC] text-[#0B1736] lg:flex">
      {/* Desktop Navy Sidebar (#0B1736) */}
      <aside
        aria-label="Admin sidebar navigation"
        className={`hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:shrink-0 lg:flex-col lg:border-r lg:border-white/[0.08] lg:bg-[#0B1736] lg:text-white transition-[width] duration-200 ease-out overflow-hidden ${shellLayout.asideWidthClass}`}
      >
        <div
          className={`flex h-14 shrink-0 items-center border-b border-white/[0.08] ${sidebarCollapsed ? 'justify-center px-2' : 'gap-2.5 px-3.5'
            }`}
        >
          <img
            src="/favicon.png"
            alt="Arvind Thevar"
            title="Arvind Thevar · Admin Console"
            referrerPolicy="no-referrer"
            className="h-8 w-8 shrink-0 rounded-lg border border-white/15 object-cover"
          />
          {shellLayout.showLabels && (
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold leading-tight tracking-[-0.01em] text-white">
                Arvind Thevar
              </p>
              <p className="truncate text-[10.5px] text-white/48">
                Admin Console
              </p>
            </div>
          )}
        </div>

        {renderSidebarLinks(false, sidebarCollapsed)}

        {sidebarCollapsed ? (
          <div className="flex shrink-0 flex-col items-center gap-1.5 border-t border-white/[0.08] px-2 py-2.5">
            <a
              href="/"
              aria-label="Open Website"
              title="Open Website"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-white/75 transition-colors hover:bg-white/[0.10] hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                aria-label="Sign out of admin console"
                title="Sign Out"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-white/65 transition-colors hover:bg-[#EF4444]/15 hover:text-[#FCA5A5]"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-1.5 border-t border-white/[0.08] px-3 py-2.5">
            <a
              href="/"
              className="flex h-8 min-w-0 flex-1 items-center justify-between gap-2 rounded-lg bg-white/[0.05] px-2.5 text-[11.5px] font-medium text-white/75 transition-colors hover:bg-white/[0.10] hover:text-white"
            >
              <span className="truncate">Open Website</span>
              <ExternalLink className="h-3 w-3 shrink-0 opacity-70" aria-hidden="true" />
            </a>
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                aria-label="Sign out of admin console"
                title="Sign Out"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/65 transition-colors hover:bg-[#EF4444]/15 hover:text-[#FCA5A5]"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Mobile Navigation Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <button
            type="button"
            aria-label="Close navigation backdrop"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-[#0B1736]/60 backdrop-blur-[1px]"
          />
          <div className="relative z-10 flex h-full w-[276px] max-w-[84vw] flex-col bg-[#0B1736] text-white shadow-2xl">
            <div className="flex h-13 shrink-0 items-center justify-between border-b border-white/[0.08] px-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <img
                  src="/favicon.png"
                  alt="Arvind Thevar"
                  referrerPolicy="no-referrer"
                  className="h-7 w-7 shrink-0 rounded-lg border border-white/15 object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold leading-tight text-white">
                    Arvind Thevar
                  </p>
                  <p className="truncate text-[10.5px] text-white/48">
                    Admin Console
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-white/85 hover:bg-white/[0.14]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {renderSidebarLinks(true)}

            <div
              style={{
                paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))',
              }}
              className="flex shrink-0 items-center gap-1.5 border-t border-white/[0.08] px-3 pt-2.5"
            >
              <a
                href="/"
                className="flex min-h-[38px] min-w-0 flex-1 items-center justify-between gap-2 rounded-lg bg-white/[0.06] px-2.5 text-[12px] font-medium text-white/85 hover:bg-white/[0.12]"
              >
                <span className="truncate">Open Website</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden="true" />
              </a>
              {onSignOut && (
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onSignOut();
                  }}
                  aria-label="Sign out of admin console"
                  className="flex min-h-[38px] w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/75 hover:bg-[#EF4444]/15 hover:text-[#FCA5A5]"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Compact Top App Bar (52px mobile, 56px desktop) */}
        <header className="sticky top-0 z-30 flex h-[54px] items-center justify-between gap-2 border-b border-[#E2E8F0] bg-white px-3 pt-safe sm:px-5 lg:h-14 lg:px-7">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* Sleek '>' Chevron Drawer Trigger on Mobile */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] text-[#145BFF] transition-colors hover:bg-[#DBEAFE] lg:hidden"
            >
              <ChevronRight className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
            </button>
            {/* Desktop Hamburger Sidebar Collapse / Expand Toggle */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!sidebarCollapsed}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#0B1736] transition-colors hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#145BFF] lg:flex cursor-pointer"
            >
              <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="hidden text-[11px] font-medium text-[#64748B] lg:block">
                {activeGroup ? activeGroup.label : 'Console'} / {activeItem.label}
              </p>
              <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#0B1736] lg:text-[16px]">
                {activeItem.label}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Notifications Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setProfileOpen(false);
                }}
                aria-expanded={notifOpen}
                aria-label={`Notifications (${unreadNotifCount} unread)`}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl text-[#0B1736] hover:bg-[#F5F7FC]"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#145BFF] px-1 text-[10px] font-bold text-white tabular-nums">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div
                    aria-hidden="true"
                    onClick={() => setNotifOpen(false)}
                    className="fixed inset-0 z-30"
                  />
                  <div
                    role="dialog"
                    aria-label="Recent notifications"
                    className="fixed top-[60px] right-3 left-3 z-40 max-h-[70dvh] overflow-y-auto overscroll-contain rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-xl sm:absolute sm:top-12 sm:right-0 sm:left-auto sm:w-80 admin-scroll"
                  >
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                      <div>
                        <span className="text-sm font-bold text-[#0B1736]">
                          Notifications
                        </span>
                        {unreadNotifications.length > 0 && (
                          <p className="text-[10.5px] text-[#64748B]">
                            {unreadEnquiriesCount > unreadNotifications.length
                              ? `Top 5 newest unread of ${unreadEnquiriesCount}`
                              : 'Latest unread notifications'}
                          </p>
                        )}
                      </div>
                      {unreadNotifications.length > 0 && (
                        <button
                          type="button"
                          onClick={onMarkAllRead}
                          className="inline-flex min-h-[32px] items-center gap-1 text-xs font-semibold text-[#145BFF] hover:underline"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="mt-2 divide-y divide-[#E2E8F0]">
                      {unreadNotifications.length === 0 ? (
                        <p className="py-4 text-center text-xs text-[#64748B]">
                          No new unread notifications.
                        </p>
                      ) : (
                        unreadNotifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              onNotificationClick(n);
                              setNotifOpen(false);
                            }}
                            className="flex w-full items-start justify-between gap-2 py-2.5 text-left transition-colors hover:bg-[#F5F7FC]"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-[#0B1736]">
                                  {n.title}
                                </span>
                                <span className="shrink-0 text-[11px] text-[#64748B]">
                                  {n.timeAgo}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-[#475569]">
                                {n.detail}
                              </p>
                            </div>
                            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#94A3B8]" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Menu Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                aria-expanded={profileOpen}
                aria-label="Admin profile menu"
                className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-2 py-1 hover:bg-[#F5F7FC] sm:px-2.5"
              >
                <img
                  src="/favicon.png"
                  alt="Arvind Thevar"
                  referrerPolicy="no-referrer"
                  className="h-7 w-7 rounded-lg object-cover"
                />
                <span className="hidden text-xs font-semibold text-[#0B1736] sm:inline">
                  {adminName || 'Arvind Thevar'}
                </span>
              </button>

              {profileOpen && (
                <>
                  <div
                    aria-hidden="true"
                    onClick={() => setProfileOpen(false)}
                    className="fixed inset-0 z-30"
                  />
                  <div
                    role="menu"
                    className="fixed top-[60px] right-3 z-40 w-[260px] max-w-[calc(100vw-24px)] rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-xl sm:absolute sm:top-12 sm:right-0"
                  >
                    <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#145BFF]">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#0B1736]">
                          {adminName || 'Arvind Thevar'}
                        </p>
                        <p className="truncate text-xs text-[#64748B]">
                          {adminEmail || PROFILE.email}
                        </p>
                        {(adminUsername || (activeSessions && maxSessions)) && (
                          <p className="mt-0.5 truncate text-[11px] font-medium text-[#145BFF]">
                            {adminUsername ? `@${adminUsername}` : ''}
                            {adminUsername && activeSessions && maxSessions ? ' · ' : ''}
                            {activeSessions && maxSessions
                              ? `Sessions ${activeSessions}/${maxSessions}`
                              : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => handleNavigate('batches')}
                        className="flex min-h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-left text-xs font-semibold text-[#0B1736] hover:bg-[#F5F7FC]"
                      >
                        <span>Manage Batches</span>
                        <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('enquiries')}
                        className="flex min-h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-left text-xs font-semibold text-[#0B1736] hover:bg-[#F5F7FC]"
                      >
                        <span>View Student Enquiries</span>
                        <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                      </button>
                      <a
                        href="/"
                        className="flex min-h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-xs font-semibold text-[#145BFF] hover:bg-[#EFF6FF]"
                      >
                        <span>View Live Website</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      {onSignOut && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            onSignOut();
                          }}
                          className="flex min-h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
                        >
                          <span>Sign Out</span>
                          <LogOut className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Workspace Content with clearance for fixed bottom bars */}
        <main
          className={`mx-auto w-full flex-1 px-3 py-4 pb-36 transition-[max-width,padding] duration-200 sm:px-5 sm:py-6 sm:pb-36 lg:pb-24 ${shellLayout.mainWidthClass}`}
        >
          {children}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar (56px + safe-area) */}
      <nav
        aria-label="Mobile quick navigation"
        className="fixed right-0 bottom-0 left-0 z-30 border-t border-[#E2E8F0] bg-white pb-safe lg:hidden"
      >
        <div className="grid h-14 grid-cols-5 items-center">
          {PRIMARY_BOTTOM_TABS.map((tabId) => {
            const item = navItems.find((n) => n.id === tabId)!;
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 transition-colors ${isActive ? 'text-[#145BFF]' : 'text-[#64748B]'
                  }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="truncate text-[10px] font-semibold">
                  {item.shortLabel}
                </span>
                {item.id === 'enquiries' && unreadEnquiriesCount > 0 && (
                  <span className="absolute top-1.5 right-3 h-2 w-2 rounded-full bg-[#145BFF]" />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreSheetOpen(true)}
            aria-expanded={moreSheetOpen}
            aria-label="More management modules"
            className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 transition-colors ${isMoreSectionActive || moreSheetOpen
              ? 'text-[#145BFF]'
              : 'text-[#64748B]'
              }`}
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            <span className="text-[10px] font-semibold">More</span>
          </button>
        </div>
      </nav>

      {/* Scrollable Mobile Bottom Sheet for Remaining Website Management Modules */}
      <MobileModalShell
        open={moreSheetOpen}
        title="Website Management"
        subtitle="Open any module below to view, edit, or upload records."
        titleId="more-modules-sheet-title"
        maxWidthClass="sm:max-w-md"
        onClose={() => setMoreSheetOpen(false)}
      >
        <div className="space-y-2">
          {MORE_SHEET_SECTIONS.map((secId) => {
            const item = navItems.find((n) => n.id === secId)!;
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${isActive
                  ? 'border-[#145BFF] bg-[#EFF6FF] text-[#145BFF]'
                  : 'border-[#E2E8F0] bg-[#F5F7FC] text-[#0B1736] hover:bg-white'
                  }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isActive
                      ? 'bg-[#145BFF] text-white'
                      : 'border border-[#E2E8F0] bg-white text-[#145BFF]'
                      }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.label}</p>
                    <p className="truncate text-xs text-[#64748B]">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className="h-5 w-5 shrink-0 opacity-70"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </MobileModalShell>
    </div>
  );
}
