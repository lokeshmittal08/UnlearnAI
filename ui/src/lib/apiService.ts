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

export interface PredictResponse {
  customer_id: string;
  customer_name: string;
  segment: string;
  nbo: string;
  score: number;
  baseline: boolean;
  raw_segment_probs: number[];
  raw_nbo_probs: number[];
  raw_score_pred: number;
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

  async triggerUnlearn(customerId: string): Promise<unknown> {
    return httpClient.post('/unlearn_trigger', { customer_id: customerId });
  }

  async predict(customerId: string): Promise<PredictResponse> {
    return httpClient.post<PredictResponse>('/predict', {
      customer_id: customerId,
    });
  }
}

export const apiService = new ApiService();
