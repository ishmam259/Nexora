import { api } from './client';

export type ProductCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
export type ProductStatus = 'ACTIVE' | 'ENDED' | 'SOLD' | 'REMOVED';
export type OrderStatus = 'AWAITING_PAYMENT' | 'PAID' | 'COMPLETED' | 'CANCELLED';

export const PRODUCT_CONDITIONS: ProductCondition[] = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];

export interface CategoryDto {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface ProductRequestDto {
  title: string;
  description: string;
  startingBid: number;
  durationHours: number;
  condition: ProductCondition;
  imageUrl: string;
  categoryId: number;
}

export interface ProductResponseDto {
  id: number;
  title: string;
  description: string;
  startingBid: number;
  currentBid: number | null;
  currentBidderId: string | null;
  bidCount: number;
  endsAt: string;
  biddingOpen: boolean;
  condition: ProductCondition;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  sellerId: string;
  status: ProductStatus;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BidRequestDto {
  productId: number;
  amount: number;
}

export interface BidResponseDto {
  id: number;
  productId: number;
  bidderId: string;
  amount: number;
  createdAt: string;
}

export interface CommentRequestDto {
  productId: number;
  content: string;
}

export interface CommentResponseDto {
  id: number;
  productId: number;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface OrderResponseDto {
  id: number;
  productId: number;
  productTitle: string;
  buyerId: string;
  sellerId: string;
  winningBidId: number | null;
  amount: number;
  status: OrderStatus;
  paymentReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export function getCategories() {
  return api.get<CategoryDto[]>('/api/marketplace/categories');
}

export function getProducts(params?: { search?: string; categoryId?: number }) {
  return api.get<ProductResponseDto[]>('/api/marketplace/products', params);
}

export function getProduct(id: number) {
  return api.get<ProductResponseDto>(`/api/marketplace/products/${id}`);
}

export function getMyProducts() {
  return api.get<ProductResponseDto[]>('/api/marketplace/products/my');
}

export function createProduct(dto: ProductRequestDto) {
  return api.post<ProductResponseDto>('/api/marketplace/products', dto);
}

export function deleteProduct(id: number) {
  return api.delete<void>(`/api/marketplace/products/${id}`);
}

export function placeBid(dto: BidRequestDto) {
  return api.post<BidResponseDto>('/api/marketplace/bids', dto);
}

export function getProductBids(productId: number) {
  return api.get<BidResponseDto[]>(`/api/marketplace/bids/product/${productId}`);
}

export function getMyBids() {
  return api.get<BidResponseDto[]>('/api/marketplace/bids/my');
}

export function getProductComments(productId: number) {
  return api.get<CommentResponseDto[]>(`/api/marketplace/comments/product/${productId}`);
}

export function addComment(dto: CommentRequestDto) {
  return api.post<CommentResponseDto>('/api/marketplace/comments', dto);
}

export function acceptHighestBid(productId: number) {
  return api.post<OrderResponseDto>(`/api/marketplace/orders/accept/${productId}`);
}

export function payOrder(orderId: number, paymentReference: string) {
  return api.post<OrderResponseDto>(`/api/marketplace/orders/${orderId}/pay`, { paymentReference });
}

export function completeOrder(orderId: number) {
  return api.post<OrderResponseDto>(`/api/marketplace/orders/${orderId}/complete`);
}

export function cancelOrder(orderId: number) {
  return api.post<OrderResponseDto>(`/api/marketplace/orders/${orderId}/cancel`);
}

export function getMyPurchases() {
  return api.get<OrderResponseDto[]>('/api/marketplace/orders/my-purchases');
}

export function getMySales() {
  return api.get<OrderResponseDto[]>('/api/marketplace/orders/my-sales');
}

export interface ImageUploadResponseDto {
  url: string;
  filename: string;
}

export async function uploadListingImage(uri: string, mimeType?: string | null, fileName?: string | null) {
  const form = new FormData();
  const name = fileName ?? `listing-${Date.now()}.jpg`;
  const type = mimeType ?? 'image/jpeg';

  if (typeof window !== 'undefined' && (uri.startsWith('blob:') || uri.startsWith('data:') || uri.startsWith('http'))) {
    const response = await fetch(uri);
    const blob = await response.blob();
    form.append('file', blob, name);
  } else {
    // React Native FormData file shape
    form.append('file', {
      uri,
      name,
      type,
    } as unknown as Blob);
  }

  return api.upload<ImageUploadResponseDto>('/api/marketplace/uploads', form);
}

/** Display amount for a listing: current high bid or starting bid. */
export function listingPrice(product: ProductResponseDto) {
  return product.currentBid ?? product.startingBid;
}
