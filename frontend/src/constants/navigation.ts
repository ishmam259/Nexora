/**
 * Canonical in-app destinations the Nexora Assistant may deep-link to.
 * Keep paths in sync with Expo Router screens under src/app/.
 */
export const APP_DESTINATIONS = [
  { path: '/', label: 'Apps home', keywords: 'home springboard apps launch' },
  { path: '/chat', label: 'Chat', keywords: 'messages conversations chat' },
  { path: '/assistant', label: 'AI Assistant', keywords: 'ai help assistant' },
  { path: '/wallet', label: 'Wallet', keywords: 'balance top up money wallet' },
  { path: '/profile', label: 'Profile', keywords: 'account settings sign out profile' },
  { path: '/marketplace', label: 'Marketplace auctions', keywords: 'bid auction buy sell marketplace listings' },
  { path: '/marketplace/new', label: 'List for auction', keywords: 'sell create listing auction post item' },
  { path: '/marketplace/orders', label: 'Auction activity', keywords: 'won bids sales pay marketplace orders' },
  { path: '/food', label: 'Food', keywords: 'restaurants menu order eat food' },
  { path: '/food/orders', label: 'Food orders', keywords: 'food order history delivery' },
  { path: '/laundry', label: 'Laundry', keywords: 'wash laundry slot booking' },
  { path: '/laundry/orders', label: 'Laundry orders', keywords: 'laundry bookings orders' },
  { path: '/print', label: 'Print', keywords: 'printing documents print desk' },
  { path: '/print/orders', label: 'Print orders', keywords: 'print jobs history' },
  { path: '/medical', label: 'Medical', keywords: 'medicine pharmacy health medical' },
  { path: '/medical/appointments', label: 'Appointments', keywords: 'doctor appointment medical book' },
  { path: '/lost-found', label: 'Lost & Found', keywords: 'lost found item report claim' },
  { path: '/lost-found/new', label: 'Report item', keywords: 'report lost found new' },
  { path: '/notifications', label: 'Notifications', keywords: 'alerts notifications' },
  { path: '/payments', label: 'Payment history', keywords: 'payments transactions history' },
] as const;

export type AppPath = (typeof APP_DESTINATIONS)[number]['path'];

const ALLOWED = new Set<string>(APP_DESTINATIONS.map((d) => d.path));

export function isAllowedAppPath(path: string): path is AppPath {
  return ALLOWED.has(path);
}

/** Markdown-style app links: [Open Food](/food) */
export const APP_LINK_REGEX = /\[([^\]]+)\]\((\/[a-zA-Z0-9\-/_]*)\)/g;

export type MessageSegment =
  | { type: 'text'; value: string }
  | { type: 'link'; label: string; path: string };

export function parseAppLinks(text: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let lastIndex = 0;
  const regex = new RegExp(APP_LINK_REGEX.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const label = match[1];
    const path = match[2];
    if (isAllowedAppPath(path)) {
      segments.push({ type: 'link', label, path });
    } else {
      segments.push({ type: 'text', value: match[0] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }];
}
