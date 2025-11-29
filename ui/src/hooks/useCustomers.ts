import { useEffect } from 'react';
import { useCustomerStore } from '@/stores';
import { customerService } from '@/services';

export const useCustomers = () => {
  const {
    customers,
    filters,
    searchQuery,
    isLoading,
    error,
    setCustomers,
    setLoading,
    setError,
  } = useCustomerStore();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await customerService.getCustomers(filters, searchQuery);
        setCustomers(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch customers'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [filters, searchQuery, setCustomers, setLoading, setError]);

  return { customers, isLoading, error };
};
