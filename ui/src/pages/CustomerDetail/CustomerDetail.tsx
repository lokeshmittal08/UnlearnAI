import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Heading,
    Text,
    Grid,
    Flex,
    Button,
    Spinner,
    Badge,
    VStack,
    IconButton,

} from '@chakra-ui/react';
import { ArrowLeft, CreditCard, Smartphone } from 'lucide-react';
import { customerService } from '@/services';
// apiService used by DataRemovalProof
import { DataRemovalProof } from '@/components/customer/DataRemovalProof/DataRemovalProof';
import { formatCurrency } from '@/utils';
import { CustomerAvatar } from '@/components/common/CustomerAvatar';
import { CustomerActionsMenu } from '@/components/common/CustomerActionsMenu';
import { AIPromo } from '@/components/customer/AIPromo';
import type { Customer } from '@/types';

export const CustomerDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // metrics moved to DataRemovalProof component

    useEffect(() => {
        const fetchCustomer = async () => {
            if (!id) return;

            try {
                setIsLoading(true);
                // Ensure all customers are loaded first
                await customerService.fetchAllCustomers();
                // Then get the specific customer from cache
                const customerData = customerService.getCustomerById(id);
                if (customerData) {
                    setCustomer(customerData);
                } else {
                    setError('Customer not found');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch customer');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomer();
    }, [id]);

    const getRiskLevel = (score: number): { level: string; color: string } => {
        if (score >= 8) return { level: 'Low Risk', color: 'green' };
        if (score >= 6) return { level: 'Medium Risk', color: 'yellow' };
        return { level: 'High Risk', color: 'red' };
    };

    const getSegmentLabel = (segment: number): string => {
        switch (segment) {
            case 0: return 'Low Value';
            case 1: return 'Medium Value';
            case 2: return 'High Value';
            default: return 'Unknown';
        }
    };

    if (isLoading) {
        return (
            <Box minH="100vh" p={6}>
                <Flex justify="center" align="center" minH="400px">
                    <Spinner size="xl" />
                </Flex>
            </Box>
        );
    }

    if (error || !customer) {
        return (
            <Box minH="100vh" p={6}>
                <Box p={4} bg="red.50" borderRadius="xl" borderWidth={1} borderColor="red.200">
                    <Text color="red.600" fontWeight="medium">
                        {error || 'Customer not found'}
                    </Text>
                </Box>
                <Button mt={4} onClick={() => navigate('/customers')}>
                    Back to Customers
                </Button>
            </Box>
        );
    }

    const riskInfo = getRiskLevel(customer.score_label);

    return (
        <Box minH="100vh" p={6}>
            {/* Header */}
            <Flex align="center" justify="space-between" mb={8}>
                <Flex align="center">
                    <IconButton
                        aria-label="Back to customers"
                        onClick={() => navigate('/customers')}
                        mr={4}
                    >
                        <ArrowLeft />
                    </IconButton>
                    <Box>
                        <Heading size="lg" mb={2}>
                            Customer Details
                        </Heading>
                        <Text color="gray.600">
                            Customer ID: {customer.customer_id}
                        </Text>
                    </Box>
                </Flex>
                <CustomerActionsMenu
                    customerId={customer.customer_id.toString()}
                    onInvokeRightToForgotten={() => {
                        // Handle right to forgotten action
                        console.log('Right to forgotten invoked for customer:', customer.customer_id);
                        // You could show a toast, modal, or navigate somewhere
                    }}
                />
            </Flex>

            {/* Customer Header Card */}
            <Box
                bg="bg"
                borderRadius="xl"
                shadow="sm"
                borderWidth={1}
                borderColor="border"
                p={6}
                mb={8}
            >
                <Flex align="center" gap={6}>
                    <CustomerAvatar name={customer.customer_name} size="lg" />
                    <Box flex={1}>
                        <Heading size="xl" mb={2}>
                            {customer.customer_name}
                        </Heading>
                        <Flex gap={4} mb={3}>
                            <Badge colorScheme="blue" fontSize="sm">
                                Age: {customer.age}
                            </Badge>
                            <Badge colorScheme="green" fontSize="sm">
                                {getSegmentLabel(customer.segment_label)}
                            </Badge>
                            <Badge colorScheme={riskInfo.color} fontSize="sm">
                                {riskInfo.level}
                            </Badge>
                        </Flex>
                        <Text color="gray.600">
                            Member for {customer.tenure_months} months
                        </Text>
                    </Box>
                    <Box textAlign="right">
                        <Text fontSize="2xl" fontWeight="bold" color="green.500">
                            {formatCurrency(customer.income)}
                        </Text>
                        <Text color="gray.600" fontSize="sm">
                            Annual Income
                        </Text>
                    </Box>
                </Flex>
            </Box>

            {/* Key Metrics */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={8}>
                <Box
                    bg="bg"
                    borderRadius="xl"
                    shadow="sm"
                    borderWidth={1}
                    borderColor="border"
                    p={6}
                >
                    <Text fontSize="sm" fontWeight="medium" color="fg.muted" mb={1}>Monthly Income</Text>
                    <Text fontSize="3xl" fontWeight="bold" color="green.500" mb={2}>
                        {formatCurrency(customer.income / 12)}
                    </Text>
                    <Text fontSize="sm" color="fg.muted">Annual: {formatCurrency(customer.income)}</Text>
                </Box>

                <Box
                    bg="bg"
                    borderRadius="xl"
                    shadow="sm"
                    borderWidth={1}
                    borderColor="border"
                    p={6}
                >
                    <Text fontSize="sm" fontWeight="medium" color="fg.muted" mb={1}>Credit Cards</Text>
                    <Text fontSize="3xl" fontWeight="bold" color="fg" mb={2}>
                        {customer.num_cards}
                    </Text>
                    <Text fontSize="sm" color="fg.muted">Active cards</Text>
                </Box>

                <Box
                    bg="bg"
                    borderRadius="xl"
                    shadow="sm"
                    borderWidth={1}
                    borderColor="border"
                    p={6}
                >
                    <Text fontSize="sm" fontWeight="medium" color="fg.muted" mb={1}>Mobile Logins</Text>
                    <Text fontSize="3xl" fontWeight="bold" color="fg" mb={2}>
                        {customer.mobile_logins}
                    </Text>
                    <Text fontSize="sm" color="fg.muted">Last 12 months</Text>
                </Box>

                <Box
                    bg="bg"
                    borderRadius="xl"
                    shadow="sm"
                    borderWidth={1}
                    borderColor="border"
                    p={6}
                >
                    <Text fontSize="sm" fontWeight="medium" color="fg.muted" mb={1}>Late Payments</Text>
                    <Text fontSize="3xl" fontWeight="bold" color={customer.late_12m > 0 ? 'red.500' : 'green.500'} mb={2}>
                        {customer.late_12m}
                    </Text>
                    <Text fontSize="sm" color="fg.muted">Last 12 months</Text>
                </Box>
            </Grid>


            {/* AI Promotional Card Recommendation */}
            <AIPromo customerId={customer.customer_id.toString()} />
            {/* Behavioral Analysis */}
            <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6} mb={8}>
                <Box
                    bg="bg"
                    borderRadius="xl"
                    shadow="sm"
                    borderWidth={1}
                    borderColor="border"
                    p={6}
                >
                    <Heading size="md" mb={4}>Digital Behavior</Heading>
                    <VStack gap={4} align="stretch">
                        <Box>
                            <Flex justify="space-between" mb={2}>
                                <Text fontSize="sm">Online Banking Usage</Text>
                                <Text fontSize="sm" fontWeight="bold">
                                    {Math.round(customer.online_ratio * 100)}%
                                </Text>
                            </Flex>
                            <Box bg="gray.200" borderRadius="full" h={2}>
                                <Box
                                    bg="blue.500"
                                    h={2}
                                    borderRadius="full"
                                    w={`${customer.online_ratio * 100}%`}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Flex justify="space-between" mb={2}>
                                <Text fontSize="sm">Travel Activity</Text>
                                <Text fontSize="sm" fontWeight="bold">
                                    {Math.round(customer.travel_ratio * 100)}%
                                </Text>
                            </Flex>
                            <Box bg="gray.200" borderRadius="full" h={2}>
                                <Box
                                    bg="purple.500"
                                    h={2}
                                    borderRadius="full"
                                    w={`${customer.travel_ratio * 100}%`}
                                />
                            </Box>
                        </Box>

                        <Box borderTopWidth={1} borderColor="gray.200" pt={4} mt={2}>
                            <Flex gap={4}>
                                <Box textAlign="center">
                                    <Box w={12} h={12} bg="blue.100" borderRadius="lg" display="flex" alignItems="center" justifyContent="center" mx="auto" mb={2}>
                                        <Smartphone size={20} />
                                    </Box>
                                    <Text fontSize="2xl" fontWeight="bold">
                                        {customer.mobile_logins}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Mobile Logins
                                    </Text>
                                </Box>
                                <Box textAlign="center">
                                    <Box w={12} h={12} bg="green.100" borderRadius="lg" display="flex" alignItems="center" justifyContent="center" mx="auto" mb={2}>
                                        <CreditCard size={20} />
                                    </Box>
                                    <Text fontSize="2xl" fontWeight="bold">
                                        {customer.num_cards}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Credit Cards
                                    </Text>
                                </Box>
                            </Flex>
                        </Box>
                    </VStack>
                </Box>

                <Box
                    bg="bg"
                    borderRadius="xl"
                    shadow="sm"
                    borderWidth={1}
                    borderColor="border"
                    p={6}
                >
                    <Heading size="md" mb={4}>Customer Profile Summary</Heading>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                        <VStack gap={3} align="stretch">
                            <Box>
                                <Text fontWeight="bold" mb={1}>Customer ID</Text>
                                <Text>{customer.customer_id}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold" mb={1}>Age</Text>
                                <Text>{customer.age} years old</Text>
                            </Box>
                        </VStack>

                        <VStack gap={3} align="stretch">
                            <Box>
                                <Text fontWeight="bold" mb={1}>Tenure</Text>
                                <Text>{customer.tenure_months} months ({Math.floor(customer.tenure_months / 12)} years)</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold" mb={1}>Annual Income</Text>
                                <Text>{formatCurrency(customer.income)}</Text>
                            </Box>
                        </VStack>
                    </Grid>
                </Box>
            </Grid>

            <DataRemovalProof customerId={customer.customer_id.toString()} />
        </Box>
    );
};