import type { FC, ReactNode } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
    return (
        <Flex minH="100vh">
            <Sidebar />
            <Flex flex="1" direction="column">
                <Header />
                <Box flex="1" p="6" overflowY="auto">
                    {children}
                </Box>
            </Flex>
        </Flex>
    );
};