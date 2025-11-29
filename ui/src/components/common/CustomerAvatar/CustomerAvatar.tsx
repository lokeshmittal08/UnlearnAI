import type { FC } from 'react';
import { Box } from '@chakra-ui/react';
import { getCustomerInitials } from '@/utils';

interface CustomerAvatarProps {
    name: string;
    size?: 'sm' | 'md' | 'lg';
}

export const CustomerAvatar: FC<CustomerAvatarProps> = ({ name, size = 'md' }) => {
    const sizeMap = {
        sm: { width: 12, height: 12, fontSize: 'lg' },
        md: { width: 16, height: 16, fontSize: 'xl' },
        lg: { width: 20, height: 20, fontSize: 'xl' },
    };

    const dimensions = sizeMap[size];

    return (
        <Box
            w={dimensions.width}
            h={dimensions.height}
            bg="blue.500"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
            fontSize={dimensions.fontSize}
        >
            {getCustomerInitials(name)}
        </Box>
    );
};