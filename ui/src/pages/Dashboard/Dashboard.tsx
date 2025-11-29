import { useState, useEffect } from 'react';
import { CustomerCard } from '@/components/customer/CustomerCard/CustomerCard';
import { MetricsCard } from '@/components/dashboard/MetricsCard/MetricsCard';
import { Analytics } from '@/components/dashboard/Analytics/Analytics';
import { TransactionHistory } from '@/components/dashboard/TransactionHistory/TransactionHistory';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerStore } from '@/stores';
import { useNavigate } from 'react-router-dom';
import { customerService } from '@/services';
import { formatCurrency } from '@/utils';
import {
    Box,
    Container,
    Grid,
    Heading,
    Text,
    Input,
    Button,
    Spinner,
    Flex,
} from '@chakra-ui/react';

const UsersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
);

const DollarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const AlertIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
);

export const Dashboard = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { customers, isLoading, error } = useCustomers();
    const { filters, setFilters, clearFilters } = useCustomerStore();
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState<Array<{
        title: string;
        value: string;
        change: { value: number; type: 'increase' | 'decrease' };
        icon: React.ReactNode;
    }>>([]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const customerMetrics = await customerService.getCustomerMetrics();

                // Calculate risk metrics from customer data
                const highRiskCustomers = customers.filter(c => c.score_label < 0.3).length;
                const previousHighRisk = Math.floor(highRiskCustomers * 0.9); // Assume 10% decrease
                const riskChange = ((highRiskCustomers - previousHighRisk) / previousHighRisk) * 100;
                const riskChangeType: 'increase' | 'decrease' = riskChange < 0 ? 'decrease' : 'increase';

                const realMetrics = [
                    {
                        title: 'Total Customers',
                        value: customerMetrics.totalCustomers.toString(),
                        change: { value: 12.5, type: 'increase' as const },
                        icon: <UsersIcon />
                    },
                    {
                        title: 'Total Assets',
                        value: formatCurrency(customerMetrics.totalBalance),
                        change: { value: 8.2, type: 'increase' as const },
                        icon: <DollarIcon />
                    },
                    {
                        title: 'Active Accounts',
                        value: customerMetrics.activeCustomers.toString(),
                        change: { value: 3.1, type: 'increase' as const },
                        icon: <TrendingUpIcon />
                    },
                    {
                        title: 'High Risk',
                        value: highRiskCustomers.toString(),
                        change: { value: Math.abs(riskChange), type: riskChangeType },
                        icon: <AlertIcon />
                    }
                ];

                setMetrics(realMetrics);
            } catch (err) {
                console.error('Failed to fetch metrics:', err);
                // Fallback to basic metrics
                const fallbackMetrics = [
                    {
                        title: 'Total Customers',
                        value: customers.length.toString(),
                        change: { value: 12.5, type: 'increase' as const },
                        icon: <UsersIcon />
                    },
                    {
                        title: 'Total Assets',
                        value: '$0',
                        change: { value: 8.2, type: 'increase' as const },
                        icon: <DollarIcon />
                    },
                    {
                        title: 'Active Accounts',
                        value: '0',
                        change: { value: 3.1, type: 'increase' as const },
                        icon: <TrendingUpIcon />
                    },
                    {
                        title: 'High Risk',
                        value: '0',
                        change: { value: 5.4, type: 'decrease' as const },
                        icon: <AlertIcon />
                    }
                ];
                setMetrics(fallbackMetrics);
            }
        };

        if (customers.length > 0) {
            fetchMetrics();
        }
    }, [customers]);

    const handleCustomerClick = (customerId: string) => {
        navigate(`/customer/${customerId}`);
    };

    if (error) {
        return (
            <Container maxW="7xl" py={6}>
                <Box p={4} bg="red.50" borderRadius="xl" borderWidth={1} borderColor="red.200">
                    <Text color="red.600" fontWeight="medium">Error loading customers: {error}</Text>
                </Box>
            </Container>
        );
    }

    return (
        <Box minH="100vh">
            <Container maxW="7xl" py={6}>
                <Box display="flex" flexDirection="column" gap={8}>
                    {/* Header */}


                    {/* Metrics Cards */}
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
                        {metrics.map((metric, index) => (
                            <MetricsCard
                                key={index}
                                title={metric.title}
                                value={metric.value}
                                change={metric.change}
                                icon={metric.icon}
                            />
                        ))}
                    </Grid>

                    {/* Analytics Section */}
                    <Box>
                        <Heading size="lg" mb={6}>Analytics Overview</Heading>
                        <Analytics />
                    </Box>

                    {/* Transaction History & Customer Management */}
                    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={8}>
                        <TransactionHistory />

                        {/* Customer Management Section */}
                        <Box bg="white" borderRadius="xl" shadow="sm" borderWidth={1} borderColor="gray.100" p={6}>
                            <Flex justify="space-between" align="center" mb={6}>
                                <Heading size="md">Customer Management</Heading>
                                <Button
                                    size="sm"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => navigate('/customers')}
                                >
                                    View All
                                </Button>
                            </Flex>

                            {/* Search and Filters */}
                            <Box display="flex" flexDirection="column" gap={4} mb={6}>
                                <Flex wrap="wrap" gap={3} w="full">
                                    <Input
                                        placeholder="Search customers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        flex={1}
                                        minW="64"
                                    />
                                    <select
                                        value={filters.status}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ status: e.target.value as 'active' | 'inactive' | 'suspended' | 'all' })}
                                        style={{
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            backgroundColor: 'white',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </Flex>

                                <Flex wrap="wrap" gap={3} w="full">
                                    <select
                                        value={filters.accountType}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ accountType: e.target.value as 'checking' | 'savings' | 'investment' | 'credit' | 'all' })}
                                        style={{
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            backgroundColor: 'white',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="all">All Accounts</option>
                                        <option value="checking">Checking</option>
                                        <option value="savings">Savings</option>
                                        <option value="investment">Investment</option>
                                        <option value="credit">Credit</option>
                                    </select>
                                    <select
                                        value={filters.riskLevel}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ riskLevel: e.target.value as 'low' | 'medium' | 'high' | 'all' })}
                                        style={{
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            backgroundColor: 'white',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="all">All Risk Levels</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    <Button
                                        onClick={() => {
                                            setSearchQuery('');
                                            clearFilters();
                                        }}
                                        variant="outline"
                                    >
                                        Clear Filters
                                    </Button>
                                </Flex>
                            </Box>

                            {/* Customer List */}
                            {isLoading ? (
                                <Flex justify="center" py={8}>
                                    <Spinner size="lg" />
                                </Flex>
                            ) : (
                                <Box display="flex" flexDirection="column" gap={3} maxH="96" overflowY="auto">
                                    {customers.slice(0, 5).map((customer) => (
                                        <CustomerCard
                                            key={customer.customer_id}
                                            customer={customer}
                                            onClick={() => handleCustomerClick(customer.customer_id.toString())}
                                        />
                                    ))}
                                    {customers.length === 0 && (
                                        <Box p={6} textAlign="center" bg="gray.50" borderRadius="lg">
                                            <Text color="gray.500">No customers found matching your criteria.</Text>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};