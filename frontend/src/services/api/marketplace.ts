import { api } from './client';

export type ProductCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
export type ProductStatus = 'ACTIVE' | 'SOLD' | 'REMOVED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

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
  price: number;
  stock: number;
  condition: ProductCondition;
  imageUrl: string;
  categoryId: number;
}

export interface ProductResponseDto {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  condition: ProductCondition;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  sellerId: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  averageRating: number | null;
  reviewCount: number;
}

export interface OrderRequestDto {
  productId: number;
  quantity: number;
  buyerNote?: string;
  paymentReference: string;
}

export interface OrderResponseDto {
  id: number;
  productId: number;
  productTitle: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  quantity: number;
  status: OrderStatus;
  paymentReference: string;
  buyerNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRequestDto {
  productId: number;
  rating: number;
  comment: string;
}

export interface ReviewResponseDto {
  id: number;
  productId: number;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: string;
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

export function updateProduct(id: number, dto: ProductRequestDto) {
  return api.put<ProductResponseDto>(`/api/marketplace/products/${id}`, dto);
}

export function deleteProduct(id: number) {
  return api.delete<void>(`/api/marketplace/products/${id}`);
}

export function createOrder(dto: OrderRequestDto) {
  return api.post<OrderResponseDto>('/api/marketplace/orders', dto);
}

export function getMyPurchases() {
  return api.get<OrderResponseDto[]>('/api/marketplace/orders/my-purchases');
}

export function getMySales() {
  return api.get<OrderResponseDto[]>('/api/marketplace/orders/my-sales');
}

export function updateOrderStatus(id: number, status: OrderStatus) {
  return api.put<OrderResponseDto>(`/api/marketplace/orders/${id}/status`, { status });
}

export function getProductReviews(productId: number) {
  return api.get<ReviewResponseDto[]>(`/api/marketplace/reviews/product/${productId}`);
}

export function createReview(dto: ReviewRequestDto) {
  return api.post<ReviewResponseDto>('/api/marketplace/reviews', dto);
}
