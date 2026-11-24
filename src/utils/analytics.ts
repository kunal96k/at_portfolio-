/**
 * Google Analytics 4 (GA4) event helper.
 * Events fire only when GA4 is loaded via VITE_GA_ID.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Dynamically initialize Google Analytics 4 if VITE_GA_ID is configured in the environment.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  const gaId = (
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_GA_ID as string | undefined)
      : undefined
  )?.trim();

  if (!gaId || gaId === 'G-XXXXXXXXXX') return;

  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaId, {
    send_page_view: false, // Handled manually per route navigation
  });
}

/**
 * Track route page views in GA4.
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  const gaId = (
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_GA_ID as string | undefined)
      : undefined
  )?.trim();

  if (!gaId || gaId === 'G-XXXXXXXXXX') return;

  window.gtag('config', gaId, {
    page_path: path,
    page_title: title || (typeof document !== 'undefined' ? document.title : ''),
  });
}

export function trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

export function trackPhoneClick(phone: string = '+91 88888 29652'): void {
  trackEvent('phone_click', {
    event_category: 'engagement',
    event_label: phone,
  });
}

export function trackEmailClick(email: string = 'arvindthaver@gmail.com'): void {
  trackEvent('email_click', {
    event_category: 'engagement',
    event_label: email,
  });
}

export function trackWhatsAppClick(source: string = 'website'): void {
  trackEvent('whatsapp_click', {
    event_category: 'conversion',
    event_label: source,
  });
}

export function trackSocialClick(platform: string, url: string): void {
  trackEvent('outbound_social_click', {
    event_category: 'outbound',
    platform,
    destination: url,
  });
}

export function trackEnquirySubmit(courseOrService: string): void {
  trackEvent('enquiry_form_submit', {
    event_category: 'conversion',
    service: courseOrService,
  });
}
