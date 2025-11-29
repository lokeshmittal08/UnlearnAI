import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Box, Heading, Flex, Text, Button, Badge, Spinner } from '@chakra-ui/react';
import { customerService } from '@/services';
import type { Transaction } from '@/types';

export const TransactionHistory: FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setIsLoading(true);
                // For dashboard, we'll fetch transactions for the first available customer
                // In a real app, you might want to show aggregated transactions across customers
                const customers = await customerService.getCustomers();
                if (customers.length > 0) {
                    const customerTransactions = await customerService.getCustomerTransactions(customers[0].customer_id.toString());
                    // Show only the most recent 5 transactions
                    setTransactions(customerTransactions.slice(0, 5));
                } else {
                    setTransactions([]);
                }
            } catch (err) {
                console.error('Failed to fetch transactions:', err);
                setError('Failed to load transactions');
                setTransactions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const getTransactionIcon = (type: Transaction['type']) => {
        switch (type) {
            case 'credit':
                return (
                    <Box w={8} h={8} bg="green.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                        <Text color="green.600" fontSize="sm">↓</Text>
                    </Box>
                );
            case 'debit':
                return (
                    <Box w={8} h={8} bg="red.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                        <Text color="red.600" fontSize="sm">↑</Text>
                    </Box>
                );
        }
    };

    if (isLoading) {
        return (
            <Box bg="bg" borderRadius="xl" shadow="sm" borderWidth={1} borderColor="border" p={6}>
                <Flex justify="center" py={8}>
                    <Spinner size="lg" />
                </Flex>
            </Box>
        );
    }

    if (error) {
        return (
            <Box bg="bg" borderRadius="xl" shadow="sm" borderWidth={1} borderColor="border" p={6}>
                <Text color="red.600">{error}</Text>
            </Box>
        );
    }

    return (
        <Box bg="bg" borderRadius="xl" shadow="sm" borderWidth={1} borderColor="border" p={6}>
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="md" color="fg">Recent Transactions</Heading>
                <Button size="sm" colorScheme="blue" variant="ghost">
                    View All
                </Button>
            </Flex>

            <Box display="flex" flexDirection="column" gap={4}>
                {transactions.length === 0 ? (
                    <Box p={6} textAlign="center" bg="gray.50" borderRadius="lg">
                        <Text color="gray.500">No transactions found.</Text>
                    </Box>
                ) : (
                    transactions.map((transaction) => (
                        <Flex
                            key={transaction.id}
                            justify="space-between"
                            align="center"
                            p={4}
                            bg="bg.muted"
                            borderRadius="lg"
                            _hover={{ bg: "bg.muted/80" }}
                            transition="all 0.15s"
                        >
                            <Flex align="center" gap={4}>
                                {getTransactionIcon(transaction.type)}
                                <Box>
                                    <Text fontWeight="medium" color="fg">{transaction.description}</Text>
                                    <Text fontSize="sm" color="fg.muted">{new Date(transaction.date).toLocaleDateString()}</Text>
                                </Box>
                            </Flex>

                            <Box textAlign="right">
                                <Text
                                    fontWeight="semibold"
                                    color={transaction.type === 'credit' ? 'green.600' : 'red.600'}
                                >
                                    {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                                </Text>
                                <Badge colorScheme="green" size="sm">Completed</Badge>
                            </Box>
                        </Flex>
                    ))
                )}
            </Box>
        </Box>
    );
};