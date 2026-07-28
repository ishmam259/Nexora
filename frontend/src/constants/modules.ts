import type { SymbolViewProps } from 'expo-symbols';
import type { Href } from 'expo-router';

export interface ModuleDef {
  key: string;
  label: string;
  tagline: string;
  icon: SymbolViewProps['name'];
  color: string;
  href: Href;
}

/** Campus services for the Apps springboard. AI lives in the bottom bar. */
export const MODULES: ModuleDef[] = [
  {
    key: 'marketplace',
    label: 'Marketplace',
    tagline: 'Bid on campus listings',
    icon: { ios: 'bag.fill', android: 'shopping_bag', web: 'shopping_bag' },
    color: '#6366F1',
    href: '/marketplace',
  },
  {
    key: 'food',
    label: 'Food',
    tagline: 'Order from campus eateries',
    icon: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
    color: '#F97316',
    href: '/food',
  },
  {
    key: 'laundry',
    label: 'Laundry',
    tagline: 'Book a wash slot',
    icon: { ios: 'washer.fill', android: 'local_laundry_service', web: 'local_laundry_service' },
    color: '#14B8A6',
    href: '/laundry',
  },
  {
    key: 'print',
    label: 'Print',
    tagline: 'Send docs to the print desk',
    icon: { ios: 'printer.fill', android: 'print', web: 'print' },
    color: '#3B82F6',
    href: '/print',
  },
  {
    key: 'medical',
    label: 'Medical',
    tagline: 'Book appointments & meds',
    icon: { ios: 'cross.case.fill', android: 'medical_services', web: 'medical_services' },
    color: '#F43F5E',
    href: '/medical',
  },
  {
    key: 'lost-found',
    label: 'Lost & Found',
    tagline: 'Report or claim an item',
    icon: { ios: 'magnifyingglass', android: 'search', web: 'search' },
    color: '#EAB308',
    href: '/lost-found',
  },
];

export const AI_ASSISTANT_COLOR = '#8B5CF6';
export const CHAT_COLOR = '#0F766E';
export const WALLET_COLOR = '#10B981';
export const NOTIFICATIONS_COLOR = '#64748B';

/** Springboard only — destinations not already in the tab bar. */
export const SPRINGBOARD_ITEMS: ModuleDef[] = [
  ...MODULES,
  {
    key: 'notifications',
    label: 'Alerts',
    tagline: 'Campus notifications',
    icon: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
    color: NOTIFICATIONS_COLOR,
    href: '/notifications',
  },
];
