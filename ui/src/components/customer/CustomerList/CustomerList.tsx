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
import { formatCurrency, getStatusColor } from '@/utils';
import {
    Box,
    Table,
    Badge,
    Button,
    Input,
    Flex,
    Text,
    Avatar,
    HStack,
    VStack,
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
            columnHelper.accessor('firstName', {
                header: 'Customer',
                cell: (info) => {
                    const customer = info.row.original;
                    return (
                        <HStack>
                            <Avatar.Root size="sm">
                                <Avatar.Fallback>
                                    {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                                </Avatar.Fallback>
                            </Avatar.Root>
                            <VStack align="start" gap={0}>
                                <Text fontWeight="medium">
                                    {customer.firstName} {customer.lastName}
                                </Text>
                                <Text fontSize="sm" color="fg.muted">
                                    {customer.email}
                                </Text>
                            </VStack>
                        </HStack>
                    );
                },
            }),
            columnHelper.accessor('status', {
                header: 'Status',
                cell: (info) => {
                    const status = info.getValue();
                    const color = getStatusColor(status);
                    return (
                        <Badge
                            colorScheme={
                                color === 'green' ? 'green' :
                                    color === 'yellow' ? 'yellow' :
                                        color === 'red' ? 'red' : 'gray'
                            }
                        >
                            {status}
                        </Badge>
                    );
                },
            }),
            columnHelper.accessor('riskLevel', {
                header: 'Risk Level',
                cell: (info) => {
                    const risk = info.getValue();
                    const color = getStatusColor(risk);
                    return (
                        <Badge
                            colorScheme={
                                color === 'green' ? 'green' :
                                    color === 'yellow' ? 'yellow' :
                                        color === 'red' ? 'red' : 'gray'
                            }
                        >
                            {risk}
                        </Badge>
                    );
                },
            }),
            columnHelper.accessor((row) => row.accounts.reduce((sum, acc) => sum + acc.balance, 0), {
                id: 'totalBalance',
                header: 'Total Balance',
                cell: (info) => (
                    <Text fontWeight="medium" color="blue.600">
                        {formatCurrency(info.getValue())}
                    </Text>
                ),
            }),
            columnHelper.accessor('accounts', {
                header: 'Accounts',
                cell: (info) => (
                    <Text>{info.getValue().length}</Text>
                ),
            }),
            columnHelper.accessor('registrationDate', {
                header: 'Registration Date',
                cell: (info) => (
                    <Text>{new Date(info.getValue()).toLocaleDateString()}</Text>
                ),
            }),
        ],
        []
    );

    const table = useReactTable({
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