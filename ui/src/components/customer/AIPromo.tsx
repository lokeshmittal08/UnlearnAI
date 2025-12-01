import type { FC } from 'react';
import { useState } from 'react';
import { Box, Heading, Button, VStack, Text, Badge, Grid, Flex } from '@chakra-ui/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { customerService } from '@/services';
import type { PredictResponse } from '@/lib/apiService';
import { CreditCard } from '@/components/common/CreditCard';
import { RiskScoreGauge } from '@/components/common/RiskScoreGauge';

interface AIPromoProps {
    customerId: string;
}

export const AIPromo: FC<AIPromoProps> = ({ customerId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [prediction, setPrediction] = useState<PredictResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPredictionDetailsExpanded, setIsPredictionDetailsExpanded] = useState(false);

    const handleSuggestCard = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await customerService.predict(customerId);
            setPrediction(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get prediction');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            bg="bg"
            borderRadius="xl"
            shadow="sm"
            borderWidth={1}
            borderColor="border"
            p={6}
            mb={8}
        >
            <Heading size="md" mb={4}>AI Promotional Card Recommendation</Heading>

            {!prediction && !error && (
                <Button
                    colorScheme="blue"
                    onClick={handleSuggestCard}
                    loading={isLoading}
                    loadingText="Getting Recommendation..."
                >
                    Suggest Promotional Card
                </Button>
            )}

            {error && (
                <Box>
                    <Text color="red.500" mb={4}>
                        Error: {error}
                    </Text>
                    <Button
                        colorScheme="blue"
                        onClick={handleSuggestCard}
                        loading={isLoading}
                        loadingText="Getting Recommendation..."
                    >
                        Try Again
                    </Button>
                </Box>
            )}

            {prediction && (
                <VStack gap={6} align="stretch">
                    {/* Main content grid with metrics and credit card */}
                    <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
                        {/* Metrics section - spans 2 columns on large screens */}
                        <Box gridColumn={{ base: '1', lg: 'span 2' }}>
                            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} mb={6}>
                                <Box>
                                    <Text fontWeight="bold" mb={1}>Segment</Text>
                                    <Badge colorScheme="green" fontSize="sm">
                                        {prediction.segment}
                                    </Badge>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" mb={1}>NBO Recommendation</Text>
                                    <Badge colorScheme="blue" fontSize="sm">
                                        {prediction.nbo}
                                    </Badge>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" mb={1}>Confidence Score</Text>
                                    <RiskScoreGauge
                                        score={prediction.score}
                                        showLabel={false}
                                        width="150px"
                                        height="16px"
                                    />
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" mb={1}>Baseline Model</Text>
                                    <Badge colorScheme={prediction.baseline ? "orange" : "green"} fontSize="sm">
                                        {prediction.baseline ? "Yes" : "No"}
                                    </Badge>
                                </Box>
                            </Grid>

                            {/* Prediction Details - Collapsible */}
                            <Box borderTopWidth={1} borderColor="gray.200" pt={4}>
                                <Flex
                                    justify="space-between"
                                    align="center"
                                    cursor="pointer"
                                    onClick={() => setIsPredictionDetailsExpanded(!isPredictionDetailsExpanded)}
                                    _hover={{ bg: "gray.50" }}
                                    p={2}
                                    borderRadius="md"
                                    transition="all 0.2s"
                                >
                                    <Text fontWeight="bold">Prediction Details</Text>
                                    {isPredictionDetailsExpanded ? (
                                        <ChevronUp size={16} />
                                    ) : (
                                        <ChevronDown size={16} />
                                    )}
                                </Flex>

                                {isPredictionDetailsExpanded && (
                                    <VStack gap={2} align="stretch" mt={3}>
                                        <Box>
                                            <Text fontSize="sm">Segment Probabilities: {prediction.raw_segment_probs.join(', ')}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm">NBO Probabilities: {prediction.raw_nbo_probs.join(', ')}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm">Raw Score: {prediction.raw_score_pred.toFixed(3)}</Text>
                                        </Box>
                                    </VStack>
                                )}
                            </Box>
                        </Box>

                        {/* Credit Card section - 1 column on large screens */}
                        {(prediction.nbo === "Platinum" || prediction.nbo === "Gold" || prediction.nbo === "Silver") && (
                            <Box gridColumn={{ base: '1', lg: '3' }}>
                                <Text fontWeight="bold" mb={4}>Recommended Credit Card:</Text>
                                <CreditCard
                                    cardType={prediction.nbo}
                                    customerName={prediction.customer_name}
                                    customerId={prediction.customer_id}
                                />
                            </Box>
                        )}
                    </Grid>

                    <Button
                        colorScheme="blue"
                        variant="outline"
                        onClick={handleSuggestCard}
                        loading={isLoading}
                        loadingText="Getting Recommendation..."
                    >
                        Get New Suggestion
                    </Button>
                </VStack>
            )}
        </Box>
    );
};