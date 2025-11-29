import type { FC } from 'react';
import type { Customer } from '@/types';
import { formatCurrency, getStatusColor } from '@/utils';
import { Box, Flex, Text, Badge } from '@chakra-ui/react';

interface CustomerCardProps {
    customer: Customer;
    onClick?: () => void;
}

export const CustomerCard: FC<CustomerCardProps> = ({ customer, onClick }) => {
    const totalBalance = customer.accounts.reduce((sum, account) => sum + account.balance, 0);
    const statusColor = getStatusColor(customer.status);
    const riskColor = getStatusColor(customer.riskLevel);

    const getBadgeColorScheme = (color: string) => {
        switch (color) {
            case 'green':
                return 'green';
            case 'yellow':
                return 'yellow';
            case 'red':
                return 'red';
            case 'blue':
                return 'blue';
            default:
                return 'gray';
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
                <Box
                    w={12}
                    h={12}
                    bg="blue.100"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="blue.600"
                    fontWeight="bold"
                    fontSize="lg"
                >
                    {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                </Box>
                <Box flex={1}>
                    <Flex flexDirection="column" gap={1}>
                        <Text fontWeight="bold" fontSize="lg">
                            {customer.firstName} {customer.lastName}
                        </Text>
                        <Text color="fg.muted" fontSize="sm">
                            {customer.email}
                        </Text>
                        <Flex gap={2}>
                            <Badge colorScheme={getBadgeColorScheme(statusColor)} size="sm">
                                {customer.status}
                            </Badge>
                            <Badge colorScheme={getBadgeColorScheme(riskColor)} size="sm">
                                {customer.riskLevel} risk
                            </Badge>
                        </Flex>
                    </Flex>
                </Box>
                <Flex flexDirection="column" align="flex-end" gap={1}>
                    <Text fontWeight="bold" fontSize="lg" color="blue.600">
                        {formatCurrency(totalBalance)}
                    </Text>
                    <Text color="fg.muted" fontSize="sm">
                        {customer.accounts.length} accounts
                    </Text>
                </Flex>
            </Flex>
        </Box>
    );
};