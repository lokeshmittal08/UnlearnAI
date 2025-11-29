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
          customer.firstName.toLowerCase().includes(searchLower) ||
          customer.lastName.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply other filters
    if (filters) {
      if (filters.status !== 'all') {
        filteredCustomers = filteredCustomers.filter(
          (c) => c.status === filters.status
        );
      }
      if (filters.accountType !== 'all') {
        filteredCustomers = filteredCustomers.filter((c) =>
          c.accounts.some((acc) => acc.accountType === filters.accountType)
        );
      }
      if (filters.riskLevel !== 'all') {
        filteredCustomers = filteredCustomers.filter(
          (c) => c.riskLevel === filters.riskLevel
        );
      }
    }

    return filteredCustomers;
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.customers.find((customer) => customer.id === id) || null;
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
    const activeCustomers = this.customers.filter(
      (c) => c.status === 'active'
    ).length;
    const totalBalance = this.customers.reduce((sum, customer) => {
      const customerBalance = customer.accounts.reduce(
        (accSum, account) => accSum + account.balance,
        0
      );
      return sum + customerBalance;
    }, 0);

    // Calculate new registrations in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newRegistrations = this.customers.filter((customer) => {
      const registrationDate = new Date(customer.registrationDate);
      return registrationDate >= thirtyDaysAgo;
    }).length;

    return {
      totalCustomers,
      activeCustomers,
      totalBalance,
      newRegistrations,
    };
  }
}

export const customerService = new CustomerService();
