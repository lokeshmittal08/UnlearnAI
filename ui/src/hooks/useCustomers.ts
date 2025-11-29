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
    const fetchAllCustomers = async () => {
      try {
        setLoading(true);
        // Fetch all customers once and cache them
        await customerService.fetchAllCustomers();
        // Then get filtered results
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

    fetchAllCustomers();
  }, []); // Only run once on mount

  // Effect to re-filter when filters or search change
  useEffect(() => {
    const applyFilters = async () => {
      try {
        const data = await customerService.getCustomers(filters, searchQuery);
        setCustomers(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to filter customers'
        );
      }
    };

    // Only apply filters if we have data loaded
    if (!isLoading) {
      applyFilters();
    }
  }, [filters, searchQuery, setCustomers, setError, isLoading]);

  return { customers, isLoading, error };
};
