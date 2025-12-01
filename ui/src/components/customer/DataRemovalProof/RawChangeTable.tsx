import type { FC } from 'react';
import {
    Text,
    Table,
} from '@chakra-ui/react';

interface RawChangeTableProps {
    rawChange: Record<string, number>;
}

export const RawChangeTable: FC<RawChangeTableProps> = ({ rawChange }) => {
    return (
        <>
            <Text fontWeight="bold" mb={2}>Raw Change Metrics</Text>
            <Table.Root w="full">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader bg="context7" px={3} py={2}>Metric</Table.ColumnHeader>
                        <Table.ColumnHeader bg="context7" px={3} py={2}>Value</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row bg="transparent">
                        <Table.Cell px={3} py={2} fontWeight="semibold">
                            NBO Pre-Post KL
                        </Table.Cell>
                        <Table.Cell px={3} py={2}>
                            {rawChange.raw_nbo_pre_post_kl !== undefined ? rawChange.raw_nbo_pre_post_kl.toFixed(6) : 'N/A'}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row bg="gray.100">
                        <Table.Cell px={3} py={2} fontWeight="semibold">
                            NBO L2 Distance
                        </Table.Cell>
                        <Table.Cell px={3} py={2}>
                            {rawChange.raw_nbo_l2_distance !== undefined ? rawChange.raw_nbo_l2_distance.toFixed(6) : 'N/A'}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row bg="transparent">
                        <Table.Cell px={3} py={2} fontWeight="semibold">
                            NBO CE Change
                        </Table.Cell>
                        <Table.Cell px={3} py={2}>
                            {rawChange.nbo_ce_change !== undefined ? rawChange.nbo_ce_change.toFixed(6) : 'N/A'}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row bg="gray.100">
                        <Table.Cell px={3} py={2} fontWeight="semibold">
                            Seg CE Change
                        </Table.Cell>
                        <Table.Cell px={3} py={2}>
                            {rawChange.seg_ce_change !== undefined ? rawChange.seg_ce_change.toFixed(6) : 'N/A'}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row bg="transparent">
                        <Table.Cell px={3} py={2} fontWeight="semibold">
                            Score MSE Change
                        </Table.Cell>
                        <Table.Cell px={3} py={2}>
                            {rawChange.score_mse_change !== undefined ? rawChange.score_mse_change.toFixed(6) : 'N/A'}
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table.Root>
        </>
    );
};