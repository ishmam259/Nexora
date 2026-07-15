import { api } from './client';

export type LaundryOrderStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'WASHING'
  | 'DRYING'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export interface SlotResponseDto {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LaundryOrderRequestDto {
  slotId: number;
  amount: number;
  paymentReference: string;
  weightKg: number;
  laundryType: string;
  specialInstructions?: string;
}

export interface LaundryOrderResponseDto {
  id: number;
  customerId: string;
  slotId: number;
  slotLabel: string;
  status: LaundryOrderStatus;
  amount: number;
  paymentReference: string;
  weightKg: number;
  laundryType: string;
  specialInstructions: string;
  createdAt: string;
  updatedAt: string;
}

export const LAUNDRY_TYPES = ['WASH_AND_FOLD', 'DRY_CLEAN', 'IRON_ONLY', 'WASH_AND_IRON'];

const RATE_PER_KG: Record<string, number> = {
  WASH_AND_FOLD: 40,
  DRY_CLEAN: 90,
  IRON_ONLY: 25,
  WASH_AND_IRON: 55,
};

/** Client-side estimate shown to the user before checkout; the source of truth is the server. */
export function estimateLaundryPrice(weightKg: number, laundryType: string) {
  const rate = RATE_PER_KG[laundryType] ?? 40;
  return Math.max(0, Math.round(weightKg * rate));
}

export function getSlots() {
  return api.get<SlotResponseDto[]>('/api/laundry/slots');
}

export function getSlot(id: number) {
  return api.get<SlotResponseDto>(`/api/laundry/slots/${id}`);
}

export function createLaundryOrder(dto: LaundryOrderRequestDto) {
  return api.post<LaundryOrderResponseDto>('/api/laundry/orders', dto);
}

export function getMyLaundryOrders() {
  return api.get<LaundryOrderResponseDto[]>('/api/laundry/orders/customer');
}
