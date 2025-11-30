import type { Customer, CustomerFilters, Transaction } from '@/types';
import { apiService, type PredictResponse } from '@/lib/apiService';

class CustomerService {
  private customers: Customer[] = [];

  // Fetch all customers from API (used for initial load)
  async fetchAllCustomers(): Promise<Customer[]> {
    try {
      if (this.customers.length === 0) {
        const customersData = await apiService.getCustomers();
        if (Array.isArray(customersData)) {
          this.customers = customersData;
        } else {
          console.error('API returned invalid customer data:', customersData);
          this.customers = [];
        }
      }
      return this.customers;
    } catch (error) {
      console.error('Failed to fetch all customers:', error);
      this.customers = [];
      throw error;
    }
  }

  // Get customers with filtering (used for displaying filtered results)
  async getCustomers(
    filters?: CustomerFilters,
    search?: string
  ): Promise<Customer[]> {
    try {
      // Ensure we have customer data
      if (this.customers.length === 0) {
        await this.fetchAllCustomers();
      }

      let filteredCustomers = [...this.customers];

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredCustomers = filteredCustomers.filter((customer) =>
          customer.customer_name.toLowerCase().includes(searchLower)
        );
      }

      // Apply other filters
      if (filters) {
        if (filters.status !== 'all') {
          // Use segment_label as a proxy for status (0=inactive, 1=active, 2=premium)
          const statusMap: Record<string, number> = {
            active: 1,
            inactive: 0,
            suspended: 2,
          };
          const segmentValue = statusMap[filters.status];
          if (segmentValue !== undefined) {
            filteredCustomers = filteredCustomers.filter(
              (c) => c.segment_label === segmentValue
            );
          }
        }
        if (filters.riskLevel !== 'all') {
          // Use score_label as a proxy for risk (lower score = higher risk)
          const riskMap: Record<string, [number, number]> = {
            low: [8, 10],
            medium: [5, 7],
            high: [0, 4],
          };
          const [minScore, maxScore] = riskMap[filters.riskLevel] || [0, 10];
          filteredCustomers = filteredCustomers.filter(
            (c) => c.score_label >= minScore && c.score_label <= maxScore
          );
        }
        // accountType filter removed as accounts are not in the new interface
      }

      return filteredCustomers;
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      // Return empty array as fallback
      return [];
    }
  }

  // Get a single customer by ID from cached data
  getCustomerById(id: string): Customer | null {
    return (
      this.customers.find(
        (customer) => customer.customer_id.toString() === id
      ) || null
    );
  }

  async getCustomerTransactions(customerId: string): Promise<Transaction[]> {
    try {
      return await apiService.getCustomerTransactions(customerId);
    } catch (error) {
      console.error('Failed to fetch customer transactions:', error);
      return [];
    }
  }

  async getCustomerMetrics(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    totalBalance: number;
    newRegistrations: number;
  }> {
    try {
      // Ensure we have customer data
      if (this.customers.length === 0) {
        const customersData = await apiService.getCustomers();
        // Ensure the response is an array
        if (Array.isArray(customersData)) {
          this.customers = customersData;
        } else {
          console.error('API returned invalid customer data:', customersData);
          this.customers = [];
        }
      }

      const totalCustomers = this.customers.length;
      // Use segment_label = 1 as active customers
      const activeCustomers = this.customers.filter(
        (c) => c.segment_label === 1
      ).length;
      // Use total income as proxy for total balance since accounts are not available
      const totalBalance = this.customers.reduce((sum, customer) => {
        return sum + customer.income;
      }, 0);

      // Since registrationDate is not available, use a fixed number for new registrations
      // In a real app, this would come from the API
      const newRegistrations = Math.floor(totalCustomers * 0.1); // Assume 10% are new

      return {
        totalCustomers,
        activeCustomers,
        totalBalance,
        newRegistrations,
      };
    } catch (error) {
      console.error('Failed to fetch customer metrics:', error);
      // Return default values if API fails
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        totalBalance: 0,
        newRegistrations: 0,
      };
    }
  }

  async triggerUnlearn(customerId: string): Promise<void> {
    try {
      await apiService.triggerUnlearn(customerId);
    } catch (error) {
      console.error('Failed to trigger unlearn:', error);
      throw error;
    }
  }

  async predict(customerId: string): Promise<PredictResponse> {
    try {
      return await apiService.predict(customerId);
    } catch (error) {
      console.error('Failed to get prediction:', error);
      throw error;
    }
  }
  // Clear cached customer data to force refresh from API
  clearCache(): void {
    this.customers = [];
  }

  // Refresh customer data from API
  async refreshCustomers(): Promise<void> {
    this.clearCache();
    try {
      const customersData = await apiService.getCustomers();
      if (Array.isArray(customersData)) {
        this.customers = customersData;
      } else {
        console.error('API returned invalid customer data:', customersData);
        this.customers = [];
      }
    } catch (error) {
      console.error('Failed to refresh customers:', error);
      this.customers = [];
      throw error;
    }
  }
}

export const customerService = new CustomerService();
