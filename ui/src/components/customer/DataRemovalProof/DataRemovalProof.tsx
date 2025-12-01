import type { FC } from 'react';
import { useState } from 'react';
import {
    Box,
    Heading,
    Text,
    Button,
    VStack,
    Flex,
    Spinner,
} from '@chakra-ui/react';
import { apiService } from '@/lib/apiService';
import { RemovalPredictionTable } from './RemovalPredictionTable';
import { PersonalizationGapsTable } from './PersonalizationGapsTable';
import { RawChangeTable } from './RawChangeTable';

interface RemovalProofMetrics {
    error?: string;
    pre_effective?: {
        segment?: string;
        nbo?: string;
        score?: number;
        baseline_segment?: string;
        baseline_nbo?: string;
        baseline_score?: number;
    };
    post_effective?: {
        segment?: string;
        nbo?: string;
        score?: number;
    };
    personalization_gaps?: Record<string, number>;
    raw_change?: Record<string, number>;
    interpretation?: {
        overall_summary?: string;
        bullet_points?: string[];
    };
}

interface DataRemovalProofProps {
    customerId: string;
}

export const DataRemovalProof: FC<DataRemovalProofProps> = ({ customerId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [metrics, setMetrics] = useState<RemovalProofMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const preScore = metrics?.pre_effective?.score;
    const postScore = metrics?.post_effective?.score;
    const hasDelta = typeof preScore === 'number' && typeof postScore === 'number';
    const delta = hasDelta ? postScore - preScore! : undefined;
    const deltaArrow = delta && delta > 0 ? '▲' : delta && delta < 0 ? '▼' : '';
    const deltaColor = delta && delta > 0 ? 'green.600' : delta && delta < 0 ? 'red.600' : 'gray.600';

    const handleFetch = async () => {
        setError(null);
        setMetrics(null);
        setIsLoading(true);
        try {
            const resp = await apiService.getMetrics(customerId);
            const result = resp?.result ?? resp;
            setMetrics(result);
            setIsOpen(true);
            // Clear any prior fetch error if API returned a structured error
            if (result?.error) {
                setError(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch removal proof');
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
            <Heading size="md" mb={4}>Data Removal Proof</Heading>
            <Button
                colorScheme="red"
                variant="outline"
                size="md"
                onClick={handleFetch}
            >
                {isLoading ? 'Fetching…' : 'Get Removal Proof'}
            </Button>

            {isOpen && (
                <Box mt={4} p={4} bg="gray.50" borderRadius="md" borderWidth={1} borderColor="gray.100">
                    <Heading size="sm" mb={3}>Removal Proof - Metrics</Heading>

                    {isLoading && (
                        <Flex justify="center" py={6}><Spinner /></Flex>
                    )}

                    {error && (
                        <Box mb={4} p={3} bg="red.50" borderRadius="md" borderWidth={1} borderColor="red.100">
                            <Text color="red.700">{error}</Text>
                        </Box>
                    )}

                    {metrics && !metrics.error && (
                        <>
                            <Flex gap={4}>
                                <Box flex="1">
                                    <RemovalPredictionTable
                                        metrics={metrics}
                                        hasDelta={hasDelta}
                                        delta={delta}
                                        deltaArrow={deltaArrow}
                                        deltaColor={deltaColor}
                                    />
                                </Box>
                                <Box flex="1">
                                    <PersonalizationGapsTable gaps={metrics.personalization_gaps || {}} />
                                </Box>
                            </Flex>

                            <Flex gap={4} mt={4}>
                                <Box flex="1">
                                    <RawChangeTable rawChange={metrics.raw_change || {}} />
                                </Box>
                                <Box flex="1">
                                    <Box>
                                        <Text fontWeight="bold">Interpretation</Text>
                                        <Text>{metrics.interpretation?.overall_summary}</Text>
                                        {Array.isArray(metrics.interpretation?.bullet_points) && (
                                            <VStack align="start" mt={2} gap={1}>
                                                {metrics.interpretation.bullet_points.map((b: string, i: number) => (
                                                    <Text key={i} fontSize="sm">• {b}</Text>
                                                ))}
                                            </VStack>
                                        )}
                                    </Box>
                                </Box>
                            </Flex>

                            <Box textAlign="right" mt={4}>
                                <Button onClick={() => setIsOpen(false)} mt={2}>Close</Button>
                            </Box>
                        </>
                    )}
                    {metrics?.error && (
                        <Box mb={4} p={3} bg="yellow.50" borderRadius="md" borderWidth={1} borderColor="yellow.100">
                            <Text color="yellow.700" fontWeight="bold">“Customer data is still retained within the models and has not yet been removed.”</Text>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};
