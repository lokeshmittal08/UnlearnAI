import { useState } from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { apiService } from '@/lib/apiService';

export const Settings = () => {
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            try {
                setIsResetting(true);
                await apiService.reset();
                alert('Data has been reset successfully. The page will reload.');
                window.location.reload();
            } catch (error) {
                console.error('Reset failed:', error);
                alert('Failed to reset data. Please try again.');
            } finally {
                setIsResetting(false);
            }
        }
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
                        loading={isResetting}
                        loadingText="Resetting..."
                        disabled={isResetting}
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