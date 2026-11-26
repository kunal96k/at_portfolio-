const LOCAL_DEV_API_URL = 'http://localhost:8080';
const PRODUCTION_API_URL = 'https://api.arvindthevar.com';

function readConfiguredApiBase(): string {
  const fromVite =
    typeof import.meta !== 'undefined'
      ? (import.meta.env?.VITE_API_BASE_URL as string | undefined)
      : undefined;
  if (fromVite !== undefined && fromVite !== null && fromVite.trim() !== '') {
    return fromVite.trim();
  }
  const fromNode =
    typeof process !== 'undefined'
      ? process.env?.VITE_API_BASE_URL
      : undefined;
  if (fromNode !== undefined && fromNode !== null && fromNode.trim() !== '') {
    return fromNode.trim();
  }
  return '';
}

function isProductionHost(hostname: string): boolean {
  const clean = hostname.trim().toLowerCase();
  return (
    clean === 'arvindthevar.com' ||
    clean === 'www.arvindthevar.com' ||
    clean.endsWith('.arvindthevar.com') ||
    clean === 'arvindthevar.vercel.app'
  );
}

function isLocalHostname(urlOrHost: string): boolean {
  return /^(?:https?:\/\/)?(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(
    urlOrHost.trim()
  );
}

/**
 * Resolves the Spring Boot backend API base URL safely across SSR/tests, local dev,
 * cross-origin production (https://arvindthevar.com -> https://api.arvindthevar.com),
 * and same-origin Nginx reverse-proxy deployments (VITE_API_BASE_URL="/" or "same-origin").
 */
export function getApiBaseUrl(): string {
  const configured = readConfiguredApiBase();

  if (configured === '/' || configured.toLowerCase() === 'same-origin') {
    return '';
  }

  if (typeof window !== 'undefined' && window.location) {
    const { hostname, protocol } = window.location;
    const onHttps = protocol === 'https:';
    const onProdDomain = isProductionHost(hostname);

    if (configured) {
      if ((onHttps || onProdDomain) && isLocalHostname(configured)) {
        return PRODUCTION_API_URL;
      }
      if (onHttps && configured.startsWith('http://') && !isLocalHostname(configured)) {
        return `https://${configured.slice('http://'.length)}`.replace(/\/+$/, '');
      }
      return configured.replace(/\/+$/, '');
    }

    if (onProdDomain || (onHttps && !isLocalHostname(hostname))) {
      return PRODUCTION_API_URL;
    }
  }

  return (configured || LOCAL_DEV_API_URL).replace(/\/+$/, '');
}

/**
 * Attaches query parameters cleanly to either an absolute cross-origin API URL or a
 * same-origin root-relative API path without calling new URL() on relative strings.
 */
export function buildApiEndpointUrl(
  baseEndpoint: string,
  searchParams: URLSearchParams
): string {
  const query = searchParams.toString();
  if (!query) {
    return baseEndpoint;
  }
  const separator = baseEndpoint.includes('?') ? '&' : '?';
  return `${baseEndpoint}${separator}${query}`;
}
