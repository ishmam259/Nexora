import { api } from './client';

export type FoodOrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED';

export interface RestaurantResponseDto {
  id: number;
  name: string;
  description: string;
  address: string;
  contactNumber: string;
  imageUrl: string;
  ownerId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemResponseDto {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodOrderItemRequestDto {
  menuItemId: number;
  quantity: number;
}

export interface FoodOrderItemResponseDto {
  id: number;
  menuItemId: number;
  menuItemName: string;
  price: number;
  quantity: number;
}

export interface FoodOrderRequestDto {
  restaurantId: number;
  items: FoodOrderItemRequestDto[];
  paymentReference: string;
  deliveryAddress: string;
  customerNote?: string;
}

export interface FoodOrderResponseDto {
  id: number;
  restaurantId: number;
  restaurantName: string;
  customerId: string;
  amount: number;
  status: FoodOrderStatus;
  paymentReference: string;
  deliveryAddress: string;
  customerNote: string;
  items: FoodOrderItemResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export function getRestaurants(search?: string) {
  return api.get<RestaurantResponseDto[]>('/api/food/restaurants', { search });
}

export function getRestaurant(id: number) {
  return api.get<RestaurantResponseDto>(`/api/food/restaurants/${id}`);
}

export function getMenu(restaurantId: number, availableOnly = true) {
  return api.get<MenuItemResponseDto[]>(`/api/food/restaurants/${restaurantId}/menu`, { availableOnly });
}

export function createFoodOrder(dto: FoodOrderRequestDto) {
  return api.post<FoodOrderResponseDto>('/api/food/orders', dto);
}

export function getMyFoodOrders() {
  return api.get<FoodOrderResponseDto[]>('/api/food/orders/customer');
}

export function getFoodOrder(id: number) {
  return api.get<FoodOrderResponseDto>(`/api/food/orders/${id}`);
}
