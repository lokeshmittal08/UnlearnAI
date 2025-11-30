import { Link, useLocation } from 'react-router-dom';
import { Box, Stack, Link as ChakraLink, Text } from '@chakra-ui/react';
import { BarChart3, Users, Settings } from 'lucide-react';

export const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: BarChart3 },
        { path: '/customers', label: 'Customers', icon: Users },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <Box
            w="64"
            bg="gray.100"
            borderRight="1px"
            borderColor="border"
            minH="100vh"
            p="4"
        >
            <Box>
                <Text fontSize="xl" fontWeight="bold" color="fg" mb="6" px="3">
                    BankUI
                </Text>
                <Box px="3">
                    <Stack direction="column" gap="2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const IconComponent = item.icon;
                            return (
                                <ChakraLink key={item.path} asChild>
                                    <Link to={item.path}>
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap="3"
                                            w="full"
                                            p="3"
                                            borderRadius="md"
                                            bg={isActive ? 'blue.50' : 'transparent'}
                                            color={isActive ? 'blue.600' : 'fg'}
                                            _hover={{
                                                bg: 'gray.200',
                                                color: 'blue.600',
                                            }}
                                            transition="all 0.2s"
                                        >
                                            <IconComponent size={18} />
                                            <Text fontWeight="medium">{item.label}</Text>
                                        </Box>
                                    </Link>
                                </ChakraLink>
                            );
                        })}
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
};