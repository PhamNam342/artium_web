import api from '../../services/api';
import type { Order, CreateOrderDto } from './types';

export const orderService = {
  async getUserOrders(userId?: string): Promise<Order[]> {
    const config: any = {};
    if (userId) {
      config.headers = { 'x-user-id': userId };
    }
    const response = await api.get<Order[]>('/orders', config);
    return response.data;
  },

  async getOrderById(id: string, userId?: string): Promise<Order> {
    const config: any = {};
    if (userId) {
      config.headers = { 'x-user-id': userId };
    }
    const response = await api.get<Order>(`/orders/${id}`, config);
    return response.data;
  },

  async createOrder(data: CreateOrderDto, userId?: string): Promise<Order> {
    const config: any = {};
    if (userId) {
      config.headers = { 'x-user-id': userId };
    }
    const response = await api.post<Order>('/orders', data, config);
    return response.data;
  },
};
