import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PAGES = [
  {
    fileName: '404.html',
    code: '404',
    badge: 'Route Not Found · HTTP 404',
    title: 'Page Not Found',
    subtitle: 'The requested page or resource URL could not be located on this server.',
    description:
      'The link you followed may have moved, been renamed, or been removed. Use the quick actions below to return to our main training portal or check upcoming batch schedules.',
    statusLabel: 'Edge Static Router',
    statusTone: 'indigo',
    autoRetrySeconds: 0,
    checklist: [
      'Check the URL spelling in your browser address bar',
      'Explore Red Hat Linux, Cisco CCNA/CCNP & AWS tracks from Home',
      'Contact us directly if you were looking for specific study material',
    ],
    primaryAction: { label: 'Return to Home', href: '/', icon: 'home' },
    secondaryAction: { label: 'Upcoming Batches', href: '/upcoming-batches', icon: 'calendar' },
  },
  {
    fileName: '403.html',
    code: '403',
    badge: 'Access Restricted · HTTP 403',
    title: 'Access Denied',
    subtitle: 'You do not have permission to view this restricted path or directory.',
    description:
      'Protected study files, administration endpoints, and private server directories require an authorized session or public access toggle.',
    statusLabel: 'Security Policy Guard',
    statusTone: 'amber',
    autoRetrySeconds: 0,
    checklist: [
      'Authorized administrators can sign in through the Admin Console',
      'Preview-only study materials can be opened on the Notes & Resources page',
      'Request download access directly from Arvind Thevar via WhatsApp or Email',
    ],
    primaryAction: { label: 'Return to Home', href: '/', icon: 'home' },
    secondaryAction: { label: 'Browse Study Notes', href: '/resources', icon: 'book' },
  },
  {
    fileName: '429.html',
    code: '429',
    badge: 'Rate Limit Active · HTTP 429',
    title: 'Too Many Requests',
    subtitle: 'Our server briefly throttled requests from this connection to preserve stability.',
    description:
      'You have sent more requests than allowed within a short window. Wait a few seconds and retry safely without losing your place.',
    statusLabel: 'Traffic Protection Active',
    statusTone: 'amber',
    autoRetrySeconds: 20,
    checklist: [
      'Wait 15–20 seconds before refreshing the page or resubmitting forms',
      'Avoid rapid repeated reloads while downloading files or previews',
      'Need immediate batch assistance? Call or WhatsApp directly below',
    ],
    primaryAction: { label: 'Retry Page Now', href: '#reload', icon: 'refresh' },
    secondaryAction: { label: 'Return to Home', href: '/', icon: 'home' },
  },
  {
    fileName: '500.html',
    code: '500',
    badge: 'Server Exception · HTTP 500',
    title: 'Internal Server Error',
    subtitle: 'Something unexpected interrupted your request on our server.',
    description:
      'An internal error occurred while preparing this page. Our service recovers automatically, or you can return home and retry shortly.',
    statusLabel: 'Application Fault Recovery',
    statusTone: 'rose',
    autoRetrySeconds: 0,
    checklist: [
      'Try refreshing this page once to start a clean request',
      'Return to the home page to browse courses, blogs & schedules',
      'Reach out via WhatsApp or phone if this issue keeps repeating',
    ],
    primaryAction: { label: 'Try Reloading', href: '#reload', icon: 'refresh' },
    secondaryAction: { label: 'Return to Home', href: '/', icon: 'home' },
  },
  {
    fileName: '502.html',
    code: '502',
    badge: 'Service Reconnecting · HTTP 502 / 504',
    title: 'Server Temporarily Unreachable',
    subtitle: 'Our backend application service is briefly restarting or reconnecting.',
    description:
      'Instead of showing a raw gateway error, this page lets you reconnect automatically in a few seconds while all course records and enquiries remain safely preserved.',
    statusLabel: 'Upstream Health Standby',
    statusTone: 'amber',
    autoRetrySeconds: 15,
    checklist: [
      'This usually takes 10–30 seconds during rolling backend deployments',
      'No student enquiry data, courses, or study resources are affected',
      'Auto-reconnect will test the server shortly, or tap Retry Connection anytime',
    ],
    primaryAction: { label: 'Retry Connection', href: '#reload', icon: 'refresh' },
    secondaryAction: { label: 'Return to Home', href: '/', icon: 'home' },
  },
  {
    fileName: 'maintenance.html',
    code: '503',
    badge: 'Scheduled Upgrade · HTTP 503',
    title: 'Under Scheduled Maintenance',
    subtitle: 'We are upgrading our infrastructure platform to serve you better.',
    description:
      'arvindthevar.com is temporarily paused for routine server hardening, security updates, or database maintenance. Service will resume shortly — meanwhile you can contact Arvind Thevar directly.',
    statusLabel: 'Maintenance Window Active',
    statusTone: 'indigo',
    autoRetrySeconds: 30,
    checklist: [
      'All upcoming batches, notes, blogs, and enquiry records remain safe',
      'We expect full service availability shortly after upgrades complete',
      'Direct phone, WhatsApp, and email channels below remain open 24/7',
    ],
    primaryAction: { label: 'Check Availability', href: '#reload', icon: 'refresh' },
    secondaryAction: { label: 'WhatsApp Arvind Sir', href: 'https://wa.me/918888829652?text=Hello%20Arvind%20Sir%2C%20I%20wanted%20to%20enquire%20about%20upcoming%20batches.', external: true, icon: 'message' },
  },
];

function getIconSvg(name) {
  switch (name) {
    case 'home':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5.5v-6.5h-5V21H4a1 1 0 0 1-1-1V9.5Z"/></svg>`;
    case 'calendar':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    case 'book':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`;
    case 'refresh':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>`;
    case 'message':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>`;
    default:
      return '';
  }
}

function getHeroVisualSvg(code) {
  if (code === '503') {
    return `<svg class="hero-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="6" y="10" width="52" height="14" rx="4" stroke="currentColor" stroke-width="2.5"/>
      <rect x="6" y="30" width="52" height="14" rx="4" stroke="currentColor" stroke-width="2.5"/>
      <circle cx="15" cy="17" r="2.2" fill="currentColor"/>
      <circle cx="15" cy="37" r="2.2" fill="currentColor"/>
      <path d="M26 17h18M26 37h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="48" cy="48" r="11" fill="var(--surface-card)" stroke="currentColor" stroke-width="2.5"/>
      <path d="M48 43v5l3 2" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }
  if (code === '502' || code === '500' || code === '429') {
    return `<svg class="hero-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="8" y="12" width="48" height="36" rx="6" stroke="currentColor" stroke-width="2.5"/>
      <path d="M8 22h48" stroke="currentColor" stroke-width="2.2"/>
      <circle cx="15" cy="17" r="1.8" fill="currentColor"/>
      <circle cx="21" cy="17" r="1.8" fill="currentColor"/>
      <path d="M32 29v9" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
      <circle cx="32" cy="42.5" r="1.8" fill="currentColor"/>
      <path d="M22 55h20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
  }
  if (code === '403') {
    return `<svg class="hero-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M32 8 12 16v14c0 13.4 8.5 24.4 20 28 11.5-3.6 20-14.6 20-28V16L32 8Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="24" y="29" width="16" height="12" rx="3" stroke="currentColor" stroke-width="2.3"/>
      <path d="M27 29v-3.5a5 5 0 0 1 10 0V29" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>
    </svg>`;
  }
  return `<svg class="hero-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="28" cy="28" r="17" stroke="currentColor" stroke-width="2.5"/>
    <path d="m41 41 13 13" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M23 23 33 33M33 23 23 33" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

function buildHtml(page) {
  const retryBlock = page.autoRetrySeconds > 0
    ? `<div class="retry-pill" id="retry-banner" aria-live="polite">
         <span class="pulse-dot" aria-hidden="true"></span>
         <span>Auto-checking in <strong id="retry-timer">${page.autoRetrySeconds}s</strong></span>
       </div>`
    : '';

  const checklistHtml = page.checklist
    .map(
      (item, idx) =>
        `<li><span class="step-idx">${String(idx + 1).padStart(2, '0')}</span><span>${item}</span></li>`
    )
    .join('\n              ');

  const buildBtn = (action, primary) => {
    const isReload = action.href === '#reload';
    const cls = primary ? 'btn btn-primary' : 'btn btn-outline';
    const icon = getIconSvg(action.icon);
    if (isReload) {
      return `<button type="button" data-reload-btn="true" class="${cls}">${icon}<span>${action.label}</span></button>`;
    }
    const attrs = action.external
      ? ` target="_blank" rel="noopener noreferrer"`
      : '';
    return `<a href="${action.href}"${attrs} class="${cls}">${icon}<span>${action.label}</span></a>`;
  };

  return `<!doctype html>
<html lang="en-IN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${page.code} — ${page.title} | Arvind Thevar</title>
    <meta name="robots" content="noindex, nofollow" />
    <meta name="theme-color" content="#4F58DF" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <script>
      (function () {
        try {
          var stored = localStorage.getItem('arvind_portfolio_theme');
          var dark = stored === 'dark' || (!stored && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
          if (dark) {
            document.documentElement.classList.add('dark');
          }
        } catch (e) {}
      })();
    </script>
    <style>
      :root {
        --bg: #ffffff;
        --bg-soft: #f5f5f7;
        --surface-card: #ffffff;
        --surface-panel: #f8f9fc;
        --ink: #222328;
        --ink-muted: #555863;
        --border: rgba(34, 35, 40, 0.12);
        --accent: #4f58df;
        --accent-ink: #ffffff;
        --accent-soft: rgba(79, 88, 223, 0.1);
        --tone-amber: #b45309;
        --tone-amber-bg: rgba(245, 158, 11, 0.12);
        --tone-rose: #be123c;
        --tone-rose-bg: rgba(244, 63, 94, 0.12);
        --tone-indigo: #4f58df;
        --tone-indigo-bg: rgba(79, 88, 223, 0.1);
        --dot-color: rgba(79, 88, 223, 0.16);
      }

      html.dark {
        --bg: #1a1a1b;
        --bg-soft: #232325;
        --surface-card: #222224;
        --surface-panel: #29292c;
        --ink: #f8fafc;
        --ink-muted: rgba(255, 255, 255, 0.74);
        --border: rgba(255, 255, 255, 0.13);
        --accent: #d0ff71;
        --accent-ink: #1a1a1b;
        --accent-soft: rgba(208, 255, 113, 0.14);
        --tone-amber: #fcd34d;
        --tone-amber-bg: rgba(251, 191, 36, 0.14);
        --tone-rose: #fda4af;
        --tone-rose-bg: rgba(244, 63, 94, 0.16);
        --tone-indigo: #d0ff71;
        --tone-indigo-bg: rgba(208, 255, 113, 0.14);
        --dot-color: rgba(208, 255, 113, 0.12);
      }

      *, *::before, *::after { box-sizing: border-box; }

      html, body {
        margin: 0;
        padding: 0;
        min-height: 100%;
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background-color: var(--bg);
        color: var(--ink);
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
      }

      .backdrop {
        position: fixed;
        inset: 0;
        pointer-events: none;
        background-image: radial-gradient(var(--dot-color) 1.25px, transparent 1.25px);
        background-size: 26px 26px;
        opacity: 0.75;
        z-index: 0;
      }

      .page-shell {
        position: relative;
        z-index: 1;
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 16px;
      }

      /* Top Navigation Strip */
      .topbar {
        width: 100%;
        max-width: 1120px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 14px;
        border: 1px solid var(--border);
        border-radius: 16px;
        background: var(--surface-card);
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: inherit;
        min-width: 0;
      }

      .brand-mark {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: var(--accent);
        color: var(--accent-ink);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
        letter-spacing: 0.04em;
        flex-shrink: 0;
      }

      .brand-text {
        min-width: 0;
      }

      .brand-title {
        display: block;
        font-weight: 700;
        font-size: 14.5px;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .brand-sub {
        display: block;
        font-size: 11.5px;
        color: var(--ink-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .theme-btn {
        border: 1px solid var(--border);
        background: var(--surface-panel);
        color: var(--ink);
        border-radius: 999px;
        min-height: 38px;
        padding: 0 14px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        flex-shrink: 0;
      }

      .theme-btn:hover {
        border-color: var(--accent);
      }

      /* Main Responsive Error Card */
      .main-area {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 0;
      }

      .card {
        width: 100%;
        max-width: 1040px;
        background: var(--surface-card);
        border: 1px solid var(--border);
        border-radius: 22px;
        padding: 24px 20px;
        box-shadow: 0 20px 50px -24px rgba(15, 23, 42, 0.25);
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 13px;
        border-radius: 999px;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .tone-indigo { color: var(--tone-indigo); background: var(--tone-indigo-bg); }
      .tone-amber { color: var(--tone-amber); background: var(--tone-amber-bg); }
      .tone-rose { color: var(--tone-rose); background: var(--tone-rose-bg); }

      .display-code {
        margin: 14px 0 4px;
        font-size: clamp(44px, 11vw, 72px);
        font-weight: 800;
        line-height: 0.96;
        letter-spacing: -0.03em;
        color: var(--accent);
      }

      h1 {
        margin: 8px 0 0;
        font-size: clamp(24px, 4.6vw, 38px);
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -0.02em;
      }

      .subtitle {
        margin: 12px 0 0;
        font-size: clamp(15px, 2.2vw, 17px);
        font-weight: 600;
        line-height: 1.5;
        color: var(--ink);
      }

      .desc {
        margin: 10px 0 0;
        font-size: 14.5px;
        line-height: 1.65;
        color: var(--ink-muted);
      }

      .retry-pill {
        margin-top: 16px;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 8px 14px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--surface-panel);
        font-size: 13px;
        color: var(--ink-muted);
      }

      .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
      }

      .actions {
        margin-top: 22px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        min-height: 46px;
        padding: 0 20px;
        border-radius: 999px;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        border: 1px solid transparent;
        transition: transform 0.15s ease, opacity 0.15s ease, background-color 0.15s ease;
        width: 100%;
      }

      .btn svg {
        width: 17px;
        height: 17px;
        flex-shrink: 0;
      }

      .btn-primary {
        background: var(--accent);
        color: var(--accent-ink);
      }

      .btn-primary:hover {
        opacity: 0.92;
      }

      .btn-outline {
        background: transparent;
        border-color: var(--border);
        color: var(--ink);
      }

      .btn-outline:hover {
        background: var(--surface-panel);
      }

      /* Right Diagnostic & Direct Contact Panel */
      .side-panel {
        background: var(--surface-panel);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 20px 18px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 18px;
      }

      .panel-head {
        display: flex;
        align-items: center;
        gap: 14px;
        padding-bottom: 14px;
        border-bottom: 1px solid var(--border);
      }

      .icon-box {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        background: var(--accent-soft);
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .hero-svg {
        width: 34px;
        height: 34px;
      }

      .panel-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--ink-muted);
      }

      .panel-status {
        margin-top: 3px;
        font-size: 15px;
        font-weight: 700;
        color: var(--ink);
      }

      .checklist {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .checklist li {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 13.5px;
        line-height: 1.5;
        color: var(--ink-muted);
      }

      .step-idx {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11.5px;
        font-weight: 700;
        color: var(--accent);
        background: var(--accent-soft);
        padding: 2px 7px;
        border-radius: 6px;
        flex-shrink: 0;
        margin-top: 1px;
      }

      .support-box {
        padding-top: 14px;
        border-top: 1px solid var(--border);
      }

      .support-title {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--ink-muted);
        margin: 0 0 10px;
      }

      .support-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .support-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--surface-card);
        color: var(--ink);
        text-decoration: none;
        font-size: 12.5px;
        font-weight: 600;
        min-height: 42px;
        word-break: break-word;
      }

      .support-link:hover {
        border-color: var(--accent);
      }

      .support-meta {
        font-size: 11.5px;
        font-weight: 500;
        color: var(--ink-muted);
      }

      /* Footer Strip */
      .foot {
        width: 100%;
        max-width: 1120px;
        margin: 0 auto;
        padding: 10px 4px 4px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        text-align: center;
        font-size: 12px;
        color: var(--ink-muted);
      }

      /* Tablet Perspective (640px+) */
      @media (min-width: 640px) {
        .page-shell { padding: 24px; }
        .topbar { padding: 12px 18px; }
        .card { padding: 34px 32px; gap: 28px; }
        .actions { flex-direction: row; flex-wrap: wrap; }
        .btn { width: auto; min-width: 185px; }
        .support-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .support-link-full { grid-column: span 2; }
        .foot { flex-direction: row; justify-content: space-between; text-align: left; }
      }

      /* Laptop & Desktop Perspective (1024px+) */
      @media (min-width: 1024px) {
        .page-shell { padding: 28px 36px; }
        .card {
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.92fr);
          align-items: stretch;
          padding: 44px;
          gap: 36px;
        }
        .side-panel { padding: 26px 24px; }
      }
    </style>
  </head>
  <body>
    <div class="backdrop" aria-hidden="true"></div>
    <div class="page-shell">
      <header class="topbar">
        <a href="/" class="brand">
          <span class="brand-mark">AT</span>
          <span class="brand-text">
            <span class="brand-title">Arvind Thevar</span>
            <span class="brand-sub">IT Infrastructure &amp; Cloud Training</span>
          </span>
        </a>
        <button type="button" class="theme-btn" id="theme-toggle" aria-label="Toggle color theme">
          Theme
        </button>
      </header>

      <main class="main-area" role="main">
        <section class="card" aria-labelledby="err-heading">
          <div>
            <span class="badge tone-${page.statusTone}">${page.badge}</span>
            <div class="display-code" aria-hidden="true">${page.code}</div>
            <h1 id="err-heading">${page.title}</h1>
            <p class="subtitle">${page.subtitle}</p>
            <p class="desc">${page.description}</p>
            ${retryBlock}
            <div class="actions">
              ${buildBtn(page.primaryAction, true)}
              ${buildBtn(page.secondaryAction, false)}
            </div>
          </div>

          <aside class="side-panel" aria-label="Status and support details">
            <div>
              <div class="panel-head">
                <div class="icon-box">${getHeroVisualSvg(page.code)}</div>
                <div>
                  <div class="panel-label">System Status</div>
                  <div class="panel-status">${page.statusLabel}</div>
                </div>
              </div>
              <ul class="checklist" style="margin-top: 16px;">
              ${checklistHtml}
              </ul>
            </div>

            <div class="support-box">
              <p class="support-title">Direct Training Support (Nashik &amp; Online)</p>
              <div class="support-grid">
                <a href="tel:+918888829652" class="support-link">
                  <span>Call</span>
                  <span class="support-meta">+91 88888 29652</span>
                </a>
                <a href="https://wa.me/918888829652" target="_blank" rel="noopener noreferrer" class="support-link">
                  <span>WhatsApp</span>
                  <span class="support-meta">Chat Now</span>
                </a>
                <a href="mailto:arvindthaver@gmail.com" class="support-link support-link-full">
                  <span>Email Support</span>
                  <span class="support-meta">arvindthaver@gmail.com</span>
                </a>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <footer class="foot">
        <span>&copy; 2026 Arvind Thevar. All Rights Reserved.</span>
        <span>https://arvindthevar.com</span>
      </footer>
    </div>

    <script>
      (function () {
        var toggle = document.getElementById('theme-toggle');
        function syncThemeLabel() {
          if (!toggle) return;
          toggle.textContent = document.documentElement.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';
        }
        syncThemeLabel();
        if (toggle) {
          toggle.addEventListener('click', function () {
            var isDark = document.documentElement.classList.toggle('dark');
            try { localStorage.setItem('arvind_portfolio_theme', isDark ? 'dark' : 'light'); } catch (e) {}
            syncThemeLabel();
          });
        }

        document.querySelectorAll('[data-reload-btn="true"]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            window.location.reload();
          });
        });

        var retrySeconds = ${page.autoRetrySeconds};
        var timerEl = document.getElementById('retry-timer');
        if (retrySeconds > 0 && timerEl) {
          var remaining = retrySeconds;
          var interval = window.setInterval(function () {
            remaining -= 1;
            if (remaining <= 0) {
              window.clearInterval(interval);
              timerEl.textContent = 'reconnecting...';
              window.location.reload();
              return;
            }
            timerEl.textContent = remaining + 's';
          }, 1000);
        }
      })();
    </script>
  </body>
</html>
`;
}

export function generateAllErrorPages({ writeToDist = false } = {}) {
  const targets = [path.resolve(rootDir, 'public', 'error-pages')];
  if (writeToDist && fs.existsSync(path.resolve(rootDir, 'dist'))) {
    targets.push(path.resolve(rootDir, 'dist', 'error-pages'));
  }

  for (const dir of targets) {
    fs.mkdirSync(dir, { recursive: true });
    for (const page of PAGES) {
      const html = buildHtml(page);
      fs.writeFileSync(path.resolve(dir, page.fileName), html, 'utf-8');
      if (page.fileName === 'maintenance.html') {
        fs.writeFileSync(path.resolve(dir, '503.html'), html, 'utf-8');
      }
    }
  }
  return PAGES.length + 1; // +1 for 503.html alias
}

if (process.argv[1] === __filename) {
  const count = generateAllErrorPages({ writeToDist: true });
  console.log(`✓ Generated ${count} responsive Nginx error & maintenance pages in public/error-pages`);
}
