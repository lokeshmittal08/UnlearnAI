import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';

export const Settings = () => {
    const handleReset = () => {
        // Handle reset action
        console.log('Reset action triggered');
        // You could show a confirmation dialog, make an API call, etc.
    };

    return (
        <Box>
            <Box mb={6}>
                <Heading size="lg" mb={2}>
                    Settings
                </Heading>
                <Text color="gray.600">
                    Manage application settings and data
                </Text>
            </Box>

            <Box
                bg="white"
                borderRadius="xl"
                shadow="sm"
                borderWidth={1}
                borderColor="gray.100"
                p={6}
                maxW="md"
            >
                <VStack gap={4} align="stretch">
                    <Button
                        colorScheme="red"
                        size="lg"
                        onClick={handleReset}
                    >
                        Reset
                    </Button>

                    <Text fontSize="sm" color="gray.600" textAlign="center">
                        This action will reset all data, and models will be restored to their original state.</Text>
                </VStack>
            </Box>
        </Box>
    );
};