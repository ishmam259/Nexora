import { api } from './client';

export type PrintOrderStatus = 'PENDING' | 'QUEUED' | 'PRINTING' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';

export interface PrintOrderRequestDto {
  fileName: string;
  fileUrl: string;
  pageCount: number;
  color: boolean;
  doubleSided: boolean;
  copies: number;
  amount: number;
  paymentReference: string;
  customerNote?: string;
}

export interface PrintOrderResponseDto {
  id: number;
  customerId: string;
  fileName: string;
  fileUrl: string;
  pageCount: number;
  color: boolean;
  doubleSided: boolean;
  copies: number;
  amount: number;
  status: PrintOrderStatus;
  paymentReference: string;
  customerNote: string;
  createdAt: string;
  updatedAt: string;
}

const PRICE_PER_PAGE_BW = 2;
const PRICE_PER_PAGE_COLOR = 5;

/** Client-side estimate shown to the user before checkout; the source of truth is the server. */
export function estimatePrintPrice(pageCount: number, copies: number, color: boolean, doubleSided: boolean) {
  const perPage = color ? PRICE_PER_PAGE_COLOR : PRICE_PER_PAGE_BW;
  const sheets = doubleSided ? Math.ceil(pageCount / 2) : pageCount;
  return Math.max(0, sheets * perPage * Math.max(1, copies));
}

export function createPrintOrder(dto: PrintOrderRequestDto) {
  return api.post<PrintOrderResponseDto>('/api/print/orders', dto);
}

export function getMyPrintOrders() {
  return api.get<PrintOrderResponseDto[]>('/api/print/orders/customer');
}
