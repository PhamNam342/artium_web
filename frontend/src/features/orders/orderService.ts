import api from '../../services/api';
import type { Order, CreateOrderDto, PaymentLinkResponse } from './types';

export const orderService = {
  async getUserOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async createOrder(data: CreateOrderDto): Promise<Order> {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  async createPaymentLink(id: string): Promise<PaymentLinkResponse> {
    const response = await api.post<PaymentLinkResponse>(`/orders/${id}/payment`);
    return response.data;
  },

  async cancelPayment(id: string): Promise<Order> {
    const response = await api.post<Order>(`/orders/${id}/payment/cancel`);
    return response.data;
  },
};
