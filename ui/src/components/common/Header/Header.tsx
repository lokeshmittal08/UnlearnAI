import { Box, Flex, Text } from '@chakra-ui/react';

export const Header = () => {
    return (
        <Box bg="bg" borderBottom="1px" borderColor="border" py="4" px="6" shadow="sm">
            <Flex align="center" justify="space-between">
                <Box>
                    <Text fontSize="xl" fontWeight="bold" color="fg" mb="1">
                        Bank Dashboard
                    </Text>
                    <Text fontSize="sm" color="fg.muted" mt="1">
                        Monitor your banking operations and customer insights
                    </Text>
                </Box>
                <Flex align="center" gap="3">
                    <Text fontSize="sm" color="fg.muted">
                        Welcome back, Admin
                    </Text>
                </Flex>
            </Flex>
        </Box>
    );
};;