import type { FC } from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';

interface MetricsCardProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        type: 'increase' | 'decrease';
    };
    icon?: React.ReactNode;
    className?: string;
}

export const MetricsCard: FC<MetricsCardProps> = ({
    title,
    value,
    change,
    icon,
    className = ''
}) => {
    const changeColor = change?.type === 'increase' ? 'green.600' : 'red.600';
    const changeIcon = change?.type === 'increase' ? '↗' : '↘';

    return (
        <Box
            bg="bg"
            borderRadius="xl"
            shadow="sm"
            borderWidth={1}
            borderColor="border"
            p={6}
            _hover={{ shadow: "md" }}
            transition="all 0.2s"
            className={className}
        >
            <Flex justify="space-between">
                <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" color="fg.muted" mb={1}>{title}</Text>
                    <Text fontSize="3xl" fontWeight="bold" color="fg" mb={2}>{value}</Text>
                    {change && (
                        <Flex align="center" fontSize="sm" fontWeight="medium" color={changeColor}>
                            <Text mr={1}>{changeIcon}</Text>
                            <Text>{Math.abs(change.value)}%</Text>
                            <Text color="fg.muted" ml={1}>vs last month</Text>
                        </Flex>
                    )}
                </Box>
                {icon && (
                    <Box flexShrink={0} ml={4}>
                        <Box w={12} h={12} bg="blue.50" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                            {icon}
                        </Box>
                    </Box>
                )}
            </Flex>
        </Box>
    );
};