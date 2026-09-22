import type { FoodOrderStatus } from '@/services/api/food';
import type { LaundryOrderStatus } from '@/services/api/laundry';
import type { PrintOrderStatus } from '@/services/api/print';

export type ProgressTone = 'accent' | 'ok' | 'neutral';

export type OrderProgress = {
  label: string;
  fraction: number;
  tone: ProgressTone;
};

export function foodOrderProgress(status: FoodOrderStatus): OrderProgress {
  switch (status) {
    case 'PENDING':
      return { label: 'Placed', fraction: 0.15, tone: 'neutral' };
    case 'CONFIRMED':
      return { label: 'Confirmed', fraction: 0.35, tone: 'neutral' };
    case 'PREPARING':
      return { label: 'Preparing', fraction: 0.6, tone: 'neutral' };
    case 'OUT_FOR_DELIVERY':
      return { label: 'On the way', fraction: 0.85, tone: 'accent' };
    case 'COMPLETED':
      return { label: 'Delivered', fraction: 1, tone: 'ok' };
    case 'CANCELLED':
      return { label: 'Cancelled', fraction: 1, tone: 'neutral' };
  }
}

export function laundryOrderProgress(status: LaundryOrderStatus): OrderProgress {
  switch (status) {
    case 'PENDING':
      return { label: 'Booked', fraction: 0.15, tone: 'neutral' };
    case 'RECEIVED':
      return { label: 'Received', fraction: 0.3, tone: 'neutral' };
    case 'WASHING':
      return { label: 'Washing', fraction: 0.5, tone: 'neutral' };
    case 'DRYING':
      return { label: 'Drying', fraction: 0.75, tone: 'neutral' };
    case 'READY_FOR_PICKUP':
      return { label: 'Ready', fraction: 1, tone: 'ok' };
    case 'COMPLETED':
      return { label: 'Picked up', fraction: 1, tone: 'ok' };
    case 'CANCELLED':
      return { label: 'Cancelled', fraction: 1, tone: 'neutral' };
  }
}

export function printOrderProgress(status: PrintOrderStatus): OrderProgress {
  switch (status) {
    case 'PENDING':
      return { label: 'Queued', fraction: 0.2, tone: 'neutral' };
    case 'QUEUED':
      return { label: 'Queued', fraction: 0.35, tone: 'neutral' };
    case 'PRINTING':
      return { label: 'Printing', fraction: 0.65, tone: 'accent' };
    case 'READY_FOR_PICKUP':
      return { label: 'Ready', fraction: 1, tone: 'ok' };
    case 'COMPLETED':
      return { label: 'Picked up', fraction: 1, tone: 'ok' };
    case 'CANCELLED':
      return { label: 'Cancelled', fraction: 1, tone: 'neutral' };
  }
}
