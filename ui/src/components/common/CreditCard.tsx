import type { FC } from 'react';
import { Box, Text, VStack, HStack } from '@chakra-ui/react';

interface CreditCardProps {
    cardType: string;
    customerName: string;
    customerId: string;
    expiryDate?: string;
    cardNumber?: string;
}

export const CreditCard: FC<CreditCardProps> = ({
    cardType,
    customerName,
    customerId,
    expiryDate = "12/28",
    cardNumber
}) => {
    // Generate a fake card number based on customer ID
    const generateCardNumber = (id: string) => {
        const numId = parseInt(id) || 1001;
        const base = "4532";
        const generated = (numId * 17).toString().padStart(12, '0');
        return `${base} ${generated.slice(0, 4)} ${generated.slice(4, 8)} ${generated.slice(8, 12)}`;
    };

    const displayCardNumber = cardNumber || generateCardNumber(customerId);

    // Color scheme based on card type
    const getCardColors = (type: string) => {
        if (type.toLowerCase().includes('silver') || type.toLowerCase().includes('baseline')) {
            return {
                bg: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 50%, #808080 100%)',
                text: 'white',
                accent: '#E8E8E8'
            };
        }
        return {
            bg: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%)',
            text: 'white',
            accent: '#333'
        };
    };

    const colors = getCardColors(cardType);

    return (
        <Box
            bg={colors.bg}
            borderRadius="xl"
            p={6}
            w="400px"
            h="250px"
            position="relative"
            shadow="2xl"
            border="1px solid rgba(255,255,255,0.1)"
            _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
        >
            {/* Card Header */}
            <HStack justify="space-between" align="flex-start" mb={8}>
                <VStack align="flex-start" gap={1}>
                    <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color={colors.text}
                        textTransform="uppercase"
                        letterSpacing="wide"
                    >
                        {cardType}
                    </Text>
                    <Text
                        fontSize="xs"
                        color={colors.accent}
                        opacity={0.8}
                    >
                        CREDIT CARD
                    </Text>
                </VStack>

                {/* Chip-like design */}
                <Box
                    w="12"
                    h="8"
                    bg="linear-gradient(45deg, #FFD700 0%, #FFA500 100%)"
                    borderRadius="md"
                    position="relative"
                    shadow="inner"
                >
                    <Box
                        position="absolute"
                        top="1"
                        left="1"
                        w="3"
                        h="6"
                        bg="linear-gradient(45deg, #C0C0C0 0%, #808080 100%)"
                        borderRadius="sm"
                    />
                </Box>
            </HStack>

            {/* Card Number */}
            <Text
                fontSize="xl"
                fontWeight="bold"
                color={colors.text}
                letterSpacing="0.1em"
                mb={6}
                fontFamily="mono"
            >
                {displayCardNumber}
            </Text>

            {/* Card Footer */}
            <HStack justify="space-between" align="flex-end">
                <VStack align="flex-start" gap={0}>
                    <Text
                        fontSize="xs"
                        color={colors.accent}
                        opacity={0.8}
                        textTransform="uppercase"
                    >
                        Card Holder
                    </Text>
                    <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={colors.text}
                        textTransform="uppercase"
                        letterSpacing="wide"
                    >
                        {customerName}
                    </Text>
                </VStack>

                <VStack align="flex-end" gap={0}>
                    <Text
                        fontSize="xs"
                        color={colors.accent}
                        opacity={0.8}
                        textTransform="uppercase"
                    >
                        Expires
                    </Text>
                    <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={colors.text}
                        fontFamily="mono"
                    >
                        {expiryDate}
                    </Text>
                </VStack>
            </HStack>

            {/* Decorative elements */}
            <Box
                position="absolute"
                top="4"
                right="4"
                w="8"
                h="8"
                borderRadius="full"
                bg="rgba(255,255,255,0.1)"
                border="1px solid rgba(255,255,255,0.2)"
            />
        </Box>
    );
};