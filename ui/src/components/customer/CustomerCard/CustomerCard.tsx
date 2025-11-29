import type { FC } from 'react';
import type { Customer } from '@/types';
import { formatCurrency } from '@/utils';
import { CustomerAvatar } from '@/components/common/CustomerAvatar';
import { Box, Flex, Text, Badge } from '@chakra-ui/react';

interface CustomerCardProps {
    customer: Customer;
    onClick?: () => void;
}

export const CustomerCard: FC<CustomerCardProps> = ({ customer, onClick }) => {
    const getScoreColor = (score: number) => {
        if (score >= 8) return 'green';
        if (score >= 6) return 'yellow';
        return 'red';
    };

    const getSegmentLabel = (segment: number) => {
        switch (segment) {
            case 0: return 'Low Value';
            case 1: return 'Medium Value';
            case 2: return 'High Value';
            default: return 'Unknown';
        }
    };

    return (
        <Box
            cursor="pointer"
            transition="all 0.2s"
            bg="bg"
            borderWidth={1}
            borderColor="border"
            borderRadius="md"
            p={4}
            _hover={{ shadow: "md", transform: "translateY(-1px)" }}
            onClick={onClick}
        >
            <Flex align="center" gap={4}>
                <CustomerAvatar name={customer.customer_name} size="sm" />
                <Box flex={1}>
                    <Flex flexDirection="column" gap={1}>
                        <Text fontWeight="bold" fontSize="lg">
                            {customer.customer_name}
                        </Text>
                        <Text color="fg.muted" fontSize="sm">
                            Age: {customer.age} | Income: {formatCurrency(customer.income)}
                        </Text>
                        <Flex gap={2}>
                            <Badge colorScheme={getScoreColor(customer.score_label)} size="sm">
                                Score: {customer.score_label}/10
                            </Badge>
                            <Badge colorScheme="blue" size="sm">
                                {getSegmentLabel(customer.segment_label)}
                            </Badge>
                        </Flex>
                    </Flex>
                </Box>
                <Flex flexDirection="column" align="flex-end" gap={1}>
                    <Text fontWeight="bold" fontSize="lg" color="blue.600">
                        {customer.num_cards} cards
                    </Text>
                    <Text color="fg.muted" fontSize="sm">
                        {customer.tenure_months} months
                    </Text>
                </Flex>
            </Flex>
        </Box>
    );
};