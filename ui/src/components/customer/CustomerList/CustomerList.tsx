import { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table';
import type { Customer } from '@/types';
import {
    Box,
    Table,
    Button,
    Input,
    Flex,
    Text,
    HStack,
} from '@chakra-ui/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CustomerListProps {
    customers: Customer[];
    onCustomerClick?: (customer: Customer) => void;
}

const columnHelper = createColumnHelper<Customer>();

export const CustomerList = ({ customers, onCustomerClick }: CustomerListProps) => {
    const [globalFilter, setGlobalFilter] = useState('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columns = useMemo<ColumnDef<Customer, any>[]>(
        () => [
            columnHelper.accessor('customer_id', {
                header: 'Customer ID',
                cell: (info) => (
                    <Text fontWeight="medium" color="blue.600">
                        {info.getValue()}
                    </Text>
                ),
            }),
            columnHelper.accessor('customer_name', {
                header: 'Customer Name',
                cell: (info) => (
                    <Text fontWeight="medium">
                        {info.getValue()}
                    </Text>
                ),
            }),
            columnHelper.accessor('age', {
                header: 'Age',
                cell: (info) => (
                    <Text>{info.getValue()}</Text>
                ),
            }),
            columnHelper.accessor('income', {
                header: 'Income',
                cell: (info) => (
                    <Text fontWeight="medium">
                        ${info.getValue().toLocaleString()}
                    </Text>
                ),
            }),
            columnHelper.accessor('tenure_months', {
                header: 'Tenure (Months)',
                cell: (info) => (
                    <Text>{info.getValue()}</Text>
                ),
            }),
            columnHelper.accessor('num_cards', {
                header: 'Number of Cards',
                cell: (info) => (
                    <Text>{info.getValue()}</Text>
                ),
            }),
        ],
        []
    ); const table = useReactTable({
        data: customers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        globalFilterFn: 'includesString',
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={4}>
                <Input
                    placeholder="Search customers..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    maxW="sm"
                />
                <HStack>
                    <Text fontSize="sm" color="gray.600">
                        {table.getFilteredRowModel().rows.length} customers
                    </Text>
                </HStack>
            </Flex>

            <Box border="1px" borderColor="border" borderRadius="md" overflow="hidden">
                <Table.Root variant="outline">
                    <Table.Header bg="bg.muted">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Table.Row key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Table.ColumnHeader key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <HStack>
                                                    <Text>
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                    </Text>
                                                    {header.column.getIsSorted() === 'asc' && <ChevronUp size={16} />}
                                                    {header.column.getIsSorted() === 'desc' && <ChevronDown size={16} />}
                                                </HStack>
                                            </Button>
                                        )}
                                    </Table.ColumnHeader>
                                ))}
                            </Table.Row>
                        ))}
                    </Table.Header>
                    <Table.Body>
                        {table.getRowModel().rows.map((row) => (
                            <Table.Row
                                key={row.id}
                                _hover={{ bg: 'bg.muted' }}
                                cursor={onCustomerClick ? 'pointer' : 'default'}
                                onClick={() => onCustomerClick?.(row.original)}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <Table.Cell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Table.Cell>
                                ))}
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Box>

            <Flex justify="space-between" align="center" mt={4}>
                <HStack>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        style={{
                            padding: '4px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: 'white',
                            fontSize: '14px',
                            maxWidth: '80px'
                        }}
                    >
                        {[10, 20, 30, 40, 50].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    <Text fontSize="sm" color="gray.600">
                        rows per page
                    </Text>
                </HStack>

                <HStack>
                    <Button
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Text fontSize="sm">
                        Page {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                    </Text>
                    <Button
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </HStack>
            </Flex>
        </Box>
    );
};