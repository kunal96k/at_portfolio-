/**
 * Production site domain and canonical URL configuration.
 * Defaults to https://arvindthevar.com (override via VITE_SITE_URL when needed).
 */
export const PRODUCTION_SITE_URL = 'https://arvindthevar.com';

export const SITE_URL: string = (() => {
  if (typeof process !== 'undefined' && process.env?.VITE_SITE_URL) {
    return process.env.VITE_SITE_URL.replace(/\/+$/, '');
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) {
    return (import.meta.env.VITE_SITE_URL as string).replace(/\/+$/, '');
  }
  return PRODUCTION_SITE_URL;
})();

export const SITE_NAME = 'Arvind Thevar';
export const DEFAULT_OG_IMAGE = '/assets/optimized/og-share.jpg';
export const DEFAULT_OG_IMAGE_ALT =
  'Arvind Thevar — IT Trainer & IT Infrastructure Professional (Nashik, India)';
