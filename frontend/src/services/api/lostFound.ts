import { api } from './client';

export type LostItemStatus = 'LOST' | 'RESOLVED';
export type FoundItemStatus = 'FOUND' | 'RESOLVED';

export const LOST_FOUND_CATEGORIES = [
  'Electronics',
  'Documents & Cards',
  'Keys',
  'Bags & Wallets',
  'Clothing',
  'Books & Stationery',
  'Other',
];

export interface LostItemRequestDto {
  title: string;
  description: string;
  category: string;
  lostLocation: string;
  lostDate: string;
  reward?: number;
  contactDetails: string;
}

export interface LostItemResponseDto {
  id: number;
  title: string;
  description: string;
  category: string;
  lostLocation: string;
  lostDate: string;
  reward: number | null;
  status: LostItemStatus;
  reportedBy: string;
  contactDetails: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoundItemRequestDto {
  title: string;
  description: string;
  category: string;
  foundLocation: string;
  foundDate: string;
  storageLocation: string;
  contactDetails: string;
}

export interface FoundItemResponseDto {
  id: number;
  title: string;
  description: string;
  category: string;
  foundLocation: string;
  foundDate: string;
  status: FoundItemStatus;
  reportedBy: string;
  storageLocation: string;
  contactDetails: string;
  createdAt: string;
  updatedAt: string;
}

export function getLostItems(params?: { search?: string; category?: string }) {
  return api.get<LostItemResponseDto[]>('/api/lost-found/lost-items', params);
}

export function getLostItem(id: number) {
  return api.get<LostItemResponseDto>(`/api/lost-found/lost-items/${id}`);
}

export function getMyLostItems() {
  return api.get<LostItemResponseDto[]>('/api/lost-found/lost-items/my');
}

export function reportLostItem(dto: LostItemRequestDto) {
  return api.post<LostItemResponseDto>('/api/lost-found/lost-items', dto);
}

export function markLostItemStatus(id: number, status: LostItemStatus) {
  return api.put<LostItemResponseDto>(`/api/lost-found/lost-items/${id}/status`, undefined, { status });
}

export function getFoundItems(params?: { search?: string; category?: string }) {
  return api.get<FoundItemResponseDto[]>('/api/lost-found/found-items', params);
}

export function getFoundItem(id: number) {
  return api.get<FoundItemResponseDto>(`/api/lost-found/found-items/${id}`);
}

export function getMyFoundItems() {
  return api.get<FoundItemResponseDto[]>('/api/lost-found/found-items/my');
}

export function reportFoundItem(dto: FoundItemRequestDto) {
  return api.post<FoundItemResponseDto>('/api/lost-found/found-items', dto);
}

export function markFoundItemStatus(id: number, status: FoundItemStatus) {
  return api.put<FoundItemResponseDto>(`/api/lost-found/found-items/${id}/status`, undefined, { status });
}
