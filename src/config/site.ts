/**
 * Single source of truth for the site domain and canonical configuration.
 * Default: https://arvindthevar.vercel.app
 * Override via environment variable VITE_SITE_URL or VERCEL_URL.
 */
export const SITE_URL: string = (() => {
  if (typeof process !== 'undefined' && process.env?.VITE_SITE_URL) {
    return process.env.VITE_SITE_URL.replace(/\/+$/, '');
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) {
    return (import.meta.env.VITE_SITE_URL as string).replace(/\/+$/, '');
  }
  return 'https://arvindthevar.vercel.app';
})();

export const SITE_NAME = 'Arvind Thevar';
export const DEFAULT_OG_IMAGE = '/assets/optimized/og-share.jpg';
export const DEFAULT_OG_IMAGE_ALT =
  'Arvind Thevar — IT Trainer & IT Infrastructure Professional (Nashik, India)';
