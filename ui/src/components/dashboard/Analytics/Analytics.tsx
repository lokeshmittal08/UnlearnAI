import type { FC } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Box, Heading, Flex, Text, Grid } from '@chakra-ui/react';

const monthlyData = [
    { month: 'Jan', customers: 1200, revenue: 45000 },
    { month: 'Feb', customers: 1350, revenue: 52000 },
    { month: 'Mar', customers: 1180, revenue: 48000 },
    { month: 'Apr', customers: 1420, revenue: 61000 },
    { month: 'May', customers: 1580, revenue: 67000 },
    { month: 'Jun', customers: 1720, revenue: 72000 },
];

const riskData = [
    { name: 'Low Risk', value: 65, color: '#10B981' },
    { name: 'Medium Risk', value: 25, color: '#F59E0B' },
    { name: 'High Risk', value: 10, color: '#EF4444' },
];

export const Analytics: FC = () => {
    return (
        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
            {/* Customer Growth Chart */}
            <Box bg="bg" borderRadius="xl" shadow="sm" borderWidth={1} borderColor="border" p={6}>
                <Heading size="md" color="fg" mb={4}>Customer Growth</Heading>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="customers"
                            stroke="#0073E6"
                            fill="url(#colorCustomers)"
                            strokeWidth={2}
                        />
                        <defs>
                            <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0073E6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0073E6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                    </AreaChart>
                </ResponsiveContainer>
            </Box>

            {/* Revenue Chart */}
            <Box bg="bg" borderRadius="xl" shadow="sm" borderWidth={1} borderColor="border" p={6}>
                <Heading size="md" color="fg" mb={4}>Monthly Revenue</Heading>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            {/* Risk Distribution */}
            <Box bg="bg" borderRadius="xl" shadow="sm" borderWidth={1} borderColor="border" p={6}>
                <Heading size="md" color="fg" mb={4}>Risk Distribution</Heading>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={riskData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {riskData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`${value}%`, 'Percentage']}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <Flex justify="center" gap={6} mt={4}>
                    {riskData.map((item) => (
                        <Flex key={item.name} align="center" gap={2}>
                            <Box
                                w={3}
                                h={3}
                                borderRadius="full"
                                bg={item.color}
                            />
                            <Text fontSize="sm" color="gray.600">{item.name}</Text>
                        </Flex>
                    ))}
                </Flex>
            </Box>

            {/* Account Types */}
            <Box bg="bg" borderRadius="xl" shadow="sm" borderWidth={1} borderColor="border" p={6}>
                <Heading size="md" color="fg" mb={4}>Account Types</Heading>
                <Box display="flex" flexDirection="column" gap={4}>
                    {[
                        { type: 'Checking', count: 1250, percentage: 45 },
                        { type: 'Savings', count: 890, percentage: 32 },
                        { type: 'Investment', count: 420, percentage: 15 },
                        { type: 'Credit', count: 210, percentage: 8 },
                    ].map((account) => (
                        <Flex key={account.type} justify="space-between" align="center">
                            <Flex align="center" gap={3}>
                                <Box w={2} h={2} bg="blue.500" borderRadius="full" />
                                <Text fontSize="sm" fontWeight="medium" color="gray.900">{account.type}</Text>
                            </Flex>
                            <Flex align="center" gap={3}>
                                <Box flex={1} bg="gray.200" borderRadius="full" h={2} maxW={24}>
                                    <Box
                                        bg="blue.500"
                                        h={2}
                                        borderRadius="full"
                                        w={`${account.percentage}%`}
                                    />
                                </Box>
                                <Text fontSize="sm" color="gray.600" w={12}>{account.count}</Text>
                            </Flex>
                        </Flex>
                    ))}
                </Box>
            </Box>
        </Grid>
    );
};