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

/** Each campus service gets its own accent color, used consistently everywhere it appears. */
export const MODULES: ModuleDef[] = [
  {
    key: 'marketplace',
    label: 'Marketplace',
    tagline: 'Buy & sell with classmates',
    icon: { ios: 'bag.fill', android: 'shopping_bag', web: 'shopping_bag' },
    color: '#7C5CFC',
    href: '/marketplace',
  },
  {
    key: 'food',
    label: 'Food',
    tagline: 'Order from campus eateries',
    icon: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
    color: '#FF8A3D',
    href: '/food',
  },
  {
    key: 'laundry',
    label: 'Laundry',
    tagline: 'Book a wash slot',
    icon: { ios: 'washer.fill', android: 'local_laundry_service', web: 'local_laundry_service' },
    color: '#2CB1BC',
    href: '/laundry',
  },
  {
    key: 'print',
    label: 'Print',
    tagline: 'Send docs to the print desk',
    icon: { ios: 'printer.fill', android: 'print', web: 'print' },
    color: '#4C7EFF',
    href: '/print',
  },
  {
    key: 'medical',
    label: 'Medical',
    tagline: 'Book appointments & meds',
    icon: { ios: 'cross.case.fill', android: 'medical_services', web: 'medical_services' },
    color: '#FF5C7C',
    href: '/medical',
  },
  {
    key: 'lost-found',
    label: 'Lost & Found',
    tagline: 'Report or claim an item',
    icon: { ios: 'magnifyingglass', android: 'search', web: 'search' },
    color: '#F5B700',
    href: '/lost-found',
  },
];

export const AI_ASSISTANT_COLOR = '#A855F7';
export const CHAT_COLOR = '#5B4CE6';
export const WALLET_COLOR = '#22C55E';
