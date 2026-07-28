import { GATEWAY_BASE_URL } from '@/services/api/client';

/**
 * Resolve listing / media URLs for Image components.
 * Relative API paths become absolute against the gateway; local file:// and data: stay as-is.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('file://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('content:')
  ) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${GATEWAY_BASE_URL}${url}`;
  }
  return `${GATEWAY_BASE_URL}/${url}`;
}
