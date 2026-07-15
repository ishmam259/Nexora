import { api, SpringPage } from './client';

export type WalletTransactionType = 'CREDIT' | 'DEBIT' | 'REFUND';

export interface WalletResponseDto {
  id: number;
  userId: string;
  balance: number;
  currency: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTopUpRequestDto {
  amount: number;
  currency?: string;
  fundingSource: string;
  externalReference: string;
}

export interface WalletTransactionResponseDto {
  id: number;
  walletId: number;
  type: WalletTransactionType;
  amount: number;
  balanceAfter: number;
  paymentId: number | null;
  description: string;
  referenceId: string;
  createdAt: string;
}

export function getMyWallet() {
  return api.get<WalletResponseDto>('/api/wallet/me');
}

export function topUpWallet(dto: WalletTopUpRequestDto) {
  return api.post<WalletTransactionResponseDto>('/api/wallet/topup', dto);
}

export function getMyWalletTransactions(page = 0, size = 20) {
  return api.get<SpringPage<WalletTransactionResponseDto>>('/api/wallet/me/transactions', {
    page,
    size,
    sort: 'createdAt,desc',
  });
}

export const WALLET_FUNDING_SOURCES = ['BKASH', 'NAGAD', 'ROCKET', 'BANK_TRANSFER'] as const;
