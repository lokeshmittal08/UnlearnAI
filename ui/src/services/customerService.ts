import type { Customer, CustomerFilters, Transaction } from '@/types';
import {
  mockCustomers,
  generateMockTransactions,
} from '@/data/mockDataGenerator';

class CustomerService {
  private customers: Customer[] = mockCustomers;

  async getCustomers(
    filters?: CustomerFilters,
    search?: string
  ): Promise<Customer[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredCustomers = [...this.customers];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(
        (customer) =>
          customer.customer_name.toLowerCase().includes(searchLower)
      );
    }

    // Apply other filters
    if (filters) {
      // Note: The new Customer interface doesn't have status, accountType, riskLevel
      // These filters are kept for backward compatibility but may not work as expected
      if (filters.status !== 'all') {
        // Use segment_label as a proxy for status (0=inactive, 1=active, 2=premium)
        const statusMap: Record<string, number> = {
          'active': 1,
          'inactive': 0,
          'suspended': 2
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
          'low': [8, 10],
          'medium': [5, 7],
          'high': [0, 4]
        };
        const [minScore, maxScore] = riskMap[filters.riskLevel] || [0, 10];
        filteredCustomers = filteredCustomers.filter(
          (c) => c.score_label >= minScore && c.score_label <= maxScore
        );
      }
      // accountType filter removed as accounts are not in the new interface
    }

    return filteredCustomers;
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.customers.find((customer) => customer.customer_id.toString() === id) || null;
  }

  async getCustomerTransactions(customerId: string): Promise<Transaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    // Generate mock transactions for the customer
    // In a real app, you would filter transactions by customerId
    console.log(`Fetching transactions for customer: ${customerId}`);
    return generateMockTransactions(20);
  }

  async getCustomerMetrics(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    totalBalance: number;
    newRegistrations: number;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 200));

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
  }
}

export const customerService = new CustomerService();
