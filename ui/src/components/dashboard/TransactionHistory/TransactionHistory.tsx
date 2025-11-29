import type { FC } from 'react';
import { Box, Heading, Flex, Text, Button, Badge } from '@chakra-ui/react';

interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal' | 'transfer';
    amount: number;
    description: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
}

const mockTransactions: Transaction[] = [
    {
        id: '1',
        type: 'deposit',
        amount: 2500.00,
        description: 'Salary Deposit',
        date: '2024-01-15',
        status: 'completed'
    },
    {
        id: '2',
        type: 'withdrawal',
        amount: -150.00,
        description: 'ATM Withdrawal',
        date: '2024-01-14',
        status: 'completed'
    },
    {
        id: '3',
        type: 'transfer',
        amount: -500.00,
        description: 'Transfer to John Doe',
        date: '2024-01-13',
        status: 'completed'
    },
    {
        id: '4',
        type: 'deposit',
        amount: 1200.00,
        description: 'Investment Return',
        date: '2024-01-12',
        status: 'pending'
    },
    {
        id: '5',
        type: 'withdrawal',
        amount: -75.50,
        description: 'Online Purchase',
        date: '2024-01-11',
        status: 'completed'
    }
];

export const TransactionHistory: FC = () => {
    const getTransactionIcon = (type: Transaction['type']) => {
        switch (type) {
            case 'deposit':
                return (
                    <Box w={8} h={8} bg="green.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                        <Text color="green.600" fontSize="sm">↓</Text>
                    </Box>
                );
            case 'withdrawal':
                return (
                    <Box w={8} h={8} bg="red.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                        <Text color="red.600" fontSize="sm">↑</Text>
                    </Box>
                );
            case 'transfer':
                return (
                    <Box w={8} h={8} bg="blue.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                        <Text color="blue.600" fontSize="sm">↔</Text>
                    </Box>
                );
        }
    };

    const getStatusBadge = (status: Transaction['status']) => {
        switch (status) {
            case 'completed':
                return <Badge colorScheme="green" size="sm">Completed</Badge>;
            case 'pending':
                return <Badge colorScheme="yellow" size="sm">Pending</Badge>;
            case 'failed':
                return <Badge colorScheme="red" size="sm">Failed</Badge>;
        }
    };

    return (
        <Box bg="bg" borderRadius="xl" shadow="sm" borderWidth={1} borderColor="border" p={6}>
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="md" color="fg">Recent Transactions</Heading>
                <Button size="sm" colorScheme="blue" variant="ghost">
                    View All
                </Button>
            </Flex>

            <Box display="flex" flexDirection="column" gap={4}>
                {mockTransactions.map((transaction) => (
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
                                <Text fontSize="sm" color="fg.muted">{transaction.date}</Text>
                            </Box>
                        </Flex>

                        <Flex align="center" gap={4}>
                            <Box textAlign="right">
                                <Text
                                    fontWeight="semibold"
                                    color={transaction.amount > 0 ? 'green.600' : 'red.600'}
                                >
                                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                                </Text>
                                {getStatusBadge(transaction.status)}
                            </Box>
                        </Flex>
                    </Flex>
                ))}
            </Box>
        </Box>
    );
};