import type { FC } from 'react';
import { Box, Text, VStack, Flex } from '@chakra-ui/react';

interface RiskScoreGaugeProps {
    score: number; // Score between 0 and 1
    maxScore?: number;
    showLabel?: boolean;
    label?: string;
    height?: string;
    width?: string;
}

export const RiskScoreGauge: FC<RiskScoreGaugeProps> = ({
    score,
    maxScore = 1,
    showLabel = true,
    label = "Risk Score",
    height = "20px",
    width = "200px"
}) => {
    // Calculate percentage based on maxScore
    const percentage = Math.min((score / maxScore) * 100, 100);

    return (
        <VStack gap={2} align="stretch">
            {showLabel && (
                <Flex justify="space-between" align="center">
                    <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        {label}
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color="red.500">
                        {score.toFixed(2)}/{maxScore.toFixed(1)}
                    </Text>
                </Flex>
            )}

            {/* Risk Score Bar */}
            <Box
                w={width}
                h={height}
                bg="gray.200"
                borderRadius="full"
                overflow="hidden"
                position="relative"
            >
                <Box
                    w={`${percentage}%`}
                    h="100%"
                    bg="red.500"
                    borderRadius="full"
                    transition="width 0.3s ease-in-out"
                />
            </Box>

            <Text fontSize="xs" color="gray.500">
                {Math.round(percentage)}% Risk Level
            </Text>
        </VStack>
    );
};