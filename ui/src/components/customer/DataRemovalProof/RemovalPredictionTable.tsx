import type { FC } from 'react';
import {
    Box,
    Text,
    Table,
} from '@chakra-ui/react';

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

interface RemovalPredictionTableProps {
    metrics: RemovalProofMetrics;
    hasDelta: boolean;
    delta?: number;
    deltaArrow: string;
    deltaColor: string;
}

export const RemovalPredictionTable: FC<RemovalPredictionTableProps> = ({
    metrics,
    hasDelta,
    delta,
    deltaArrow,
    deltaColor,
}) => {
    return (
        <>
            <Text fontWeight="bold" mb={2}>Pre vs Post Removal Prediction</Text>
            {/* Table version using Chakra Table */}
            <Table.Root w="full">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader bg="context7" px={3} py={2} />
                        <Table.ColumnHeader bg="context7" px={3} py={2}>Before Removal</Table.ColumnHeader>
                        <Table.ColumnHeader bg="context7" px={3} py={2}>After Removal</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row bg="transparent">
                        <Table.Cell px={3} py={2} fontWeight="semibold">Segment</Table.Cell>
                        <Table.Cell px={3} py={2} maxW="220px">
                            <Box as="span" title={metrics.pre_effective?.segment ?? '—'} maxW="220px" display="inline-block" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{metrics.pre_effective?.segment ?? '—'}</Box>
                        </Table.Cell>
                        <Table.Cell px={3} py={2} maxW="220px">
                            <Box as="span" title={metrics.post_effective?.segment ?? '—'} maxW="220px" display="inline-block" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{metrics.post_effective?.segment ?? '—'}</Box>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row bg="gray.100">
                        <Table.Cell px={3} py={2} fontWeight="semibold">NBO</Table.Cell>
                        <Table.Cell px={3} py={2} maxW="220px">
                            <Box as="span" title={metrics.pre_effective?.nbo ?? '—'} maxW="220px" display="inline-block" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{metrics.pre_effective?.nbo ?? '—'}</Box>
                        </Table.Cell>
                        <Table.Cell px={3} py={2} maxW="220px">
                            <Box as="span" title={metrics.post_effective?.nbo ?? '—'} maxW="220px" display="inline-block" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{metrics.post_effective?.nbo ?? '—'}</Box>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row bg="transparent">
                        <Table.Cell px={3} py={2} fontWeight="semibold">Score</Table.Cell>
                        <Table.Cell px={3} py={2}>{typeof metrics.pre_effective?.score === 'number' ? metrics.pre_effective.score.toFixed(3) : '—'}</Table.Cell>
                        <Table.Cell px={3} py={2}>
                            {typeof metrics.post_effective?.score === 'number' ? metrics.post_effective.score.toFixed(3) : '—'}
                            {hasDelta && delta !== undefined && (
                                <Text as="span" ml={2} color={deltaColor} fontSize="sm">{deltaArrow}{Math.abs(delta).toFixed(3)}</Text>
                            )}
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table.Root>
        </>
    );
};