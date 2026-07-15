import { api, SpringPage } from './client';

export type PaymentMethodType = 'NEXORA_WALLET' | 'BANK_TRANSFER' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'CASH';
export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';

export interface PaymentRequestDto {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethodType;
  externalReference?: string;
  note?: string;
}

export interface PaymentResponseDto {
  id: number;
  orderId: string;
  payerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transactionId: string;
  paymentMethod: PaymentMethodType;
  externalReference: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export function chargePayment(dto: PaymentRequestDto) {
  return api.post<PaymentResponseDto>('/api/payments/charge', dto);
}

export function getPayment(id: number) {
  return api.get<PaymentResponseDto>(`/api/payments/${id}`);
}

export function getMyPayments() {
  return api.get<PaymentResponseDto[]>('/api/payments/my');
}

export function getMyPaymentsPaged(page = 0, size = 20) {
  return api.get<SpringPage<PaymentResponseDto>>('/api/payments/my/paged', { page, size });
}

/**
 * Pays for a domain order out of the user's Nexora Wallet and returns the
 * resulting transactionId, to be threaded through as `paymentReference` when
 * creating the domain-service order (marketplace/food/laundry/print/medical).
 */
export async function payWithWallet(orderId: string, amount: number, note?: string) {
  const payment = await chargePayment({ orderId, amount, paymentMethod: 'NEXORA_WALLET', note });
  return payment;
}
