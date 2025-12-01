import type { FC } from 'react';
import {
    Text,
    Table,
} from '@chakra-ui/react';

interface PersonalizationGapsTableProps {
    gaps: Record<string, number>;
}

export const PersonalizationGapsTable: FC<PersonalizationGapsTableProps> = ({ gaps }) => {
    return (
        <>
            <Text fontWeight="bold" mb={2}>Personalization Gaps</Text>
            <Table.Root w="full">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader bg="context7" px={3} py={2}>Key</Table.ColumnHeader>
                        <Table.ColumnHeader bg="context7" px={3} py={2}>Before Removal</Table.ColumnHeader>
                        <Table.ColumnHeader bg="context7" px={3} py={2}>Post Removal</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row bg="transparent">
                        <Table.Cell px={3} py={2} fontWeight="semibold">
                            Nbo Gap (KL to baseline)
                        </Table.Cell>
                        <Table.Cell px={3} py={2}>
                            {gaps.nbo_gap_pre_kl_to_baseline !== undefined ? gaps.nbo_gap_pre_kl_to_baseline.toFixed(6) : 'N/A'}
                        </Table.Cell>
                        <Table.Cell px={3} py={2}>
                            {gaps.nbo_gap_post_kl_to_baseline !== undefined ? gaps.nbo_gap_post_kl_to_baseline.toFixed(6) : 'N/A'}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row bg="gray.100">
                        <Table.Cell px={3} py={2} fontWeight="semibold">
                            Score Gap
                        </Table.Cell>
                        <Table.Cell px={3} py={2}>
                            {gaps.score_gap_pre_abs !== undefined ? gaps.score_gap_pre_abs.toFixed(6) : 'N/A'}
                        </Table.Cell>
                        <Table.Cell px={3} py={2}>
                            {gaps.score_gap_post_abs !== undefined ? gaps.score_gap_post_abs.toFixed(6) : 'N/A'}
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table.Root>
        </>
    );
};