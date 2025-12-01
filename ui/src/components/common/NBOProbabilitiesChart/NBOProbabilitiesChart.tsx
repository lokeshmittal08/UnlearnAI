import type { FC } from 'react';
import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface NBOProbabilitiesChartProps {
    probabilities: (number | string)[];
}

const CARD_TYPES = ['Gold', 'Silver', 'Platinum'];
const COLORS = ['#FFD700', '#C0C0C0', '#E5E5E5']; // Gold, Silver, Platinum colors

export const NBOProbabilitiesChart: FC<NBOProbabilitiesChartProps> = ({ probabilities }) => {
    // Ensure probabilities are valid numbers
    const validProbabilities = probabilities.map(prob => {
        const num = typeof prob === 'number' ? prob : parseFloat(prob as string);
        return isNaN(num) ? 0 : num;
    });

    // Prepare data for the bar chart
    const chartData = validProbabilities.map((prob, index) => ({
        name: CARD_TYPES[index] || `Type ${index}`,
        value: prob * 100, // Convert to percentage
        originalValue: prob,
        color: COLORS[index] || '#8884d8'
    }));

    return (
        <Box>
            <Text fontWeight="bold" mb={4}>NBO Probabilities Distribution</Text>

            <VStack gap={4} align="center">
                <Box w="400px" h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                formatter={(value: number | string) => {
                                    const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                                    return [`${numValue.toFixed(2)}%`, 'Probability'];
                                }}
                                labelFormatter={(label) => `${label} Card`}
                            />
                            <Bar
                                dataKey="value"
                                radius={[4, 4, 0, 0]}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                {/* Detailed breakdown */}
                <Box w="full" maxW="400px">
                    <VStack gap={2} align="center">
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">Detailed Breakdown:</Text>
                        {chartData.map((item, index) => (
                            <HStack key={index} gap={3} justify="center">
                                <Box
                                    w="12px"
                                    h="12px"
                                    borderRadius="full"
                                    bg={item.color}
                                    border="1px solid rgba(0,0,0,0.1)"
                                />
                                <Text fontSize="sm">
                                    <Text as="span" fontWeight="medium">{item.name}:</Text> {(item.originalValue * 100).toFixed(2)}%
                                </Text>
                            </HStack>
                        ))}
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};