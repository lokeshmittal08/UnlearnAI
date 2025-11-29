import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Customer, CustomerFilters } from '@/types';

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  filters: CustomerFilters;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCustomers: (customers: Customer[]) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setFilters: (filters: Partial<CustomerFilters>) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearFilters: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  devtools(
    (set) => ({
      customers: [],
      selectedCustomer: null,
      filters: {
        status: 'all',
        accountType: 'all',
        riskLevel: 'all',
      },
      searchQuery: '',
      isLoading: false,
      error: null,

      setCustomers: (customers) => set({ customers }),
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearFilters: () =>
        set({
          filters: {
            status: 'all',
            accountType: 'all',
            riskLevel: 'all',
          },
          searchQuery: '',
        }),
    }),
    { name: 'customer-store' }
  )
);
