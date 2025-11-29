import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text } from '@chakra-ui/react';
import { CustomerList } from '@/components/customer/CustomerList/CustomerList';
import { useCustomers } from '@/hooks/useCustomers';
import type { Customer } from '@/types';

export const Customers = () => {
    const { customers, isLoading, error } = useCustomers();
    const navigate = useNavigate();

    const handleCustomerClick = (customer: Customer) => {
        navigate(`/customer/${customer.id}`);
    };

    if (error) {
        return (
            <Box p={6}>
                <Box p={4} bg="red.50" borderRadius="xl" borderWidth={1} borderColor="red.200">
                    <Text color="red.600" fontWeight="medium">
                        Error loading customers: {error}
                    </Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            <Box mb={6}>
                <Heading size="lg" mb={2}>
                    Customers
                </Heading>
                <Text color="gray.600">
                    Manage and view all customer information
                </Text>
            </Box>

            {isLoading ? (
                <Box p={6}>
                    <Text>Loading customers...</Text>
                </Box>
            ) : (
                <CustomerList
                    customers={customers}
                    onCustomerClick={handleCustomerClick}
                />
            )}
        </Box>
    );
};