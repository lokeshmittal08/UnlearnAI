import type { Customer, Transaction } from '@/types';
import { httpClient } from '@/lib/httpClient';

export interface CustomerFilters {
  status?: string;
  accountType?: string;
  riskLevel?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  totalBalance: number;
  newRegistrations: number;
}

class ApiService {
  async getCustomers(): Promise<Customer[]> {
    return httpClient.get<Customer[]>('/customers');
  }

  async getCustomerById(id: string): Promise<Customer> {
    return httpClient.get<Customer>(`/customers/${id}`);
  }

  async getCustomerTransactions(customerId: string): Promise<Transaction[]> {
    return httpClient.get<Transaction[]>(
      `/customers/${customerId}/transactions`
    );
  }
}

export const apiService = new ApiService();
