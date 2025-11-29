import type { FC } from 'react';
import {
    Dialog,
    Button,
    VStack,
} from '@chakra-ui/react';

interface RightToForgottenDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProceed: () => void;
}

export const RightToForgottenDialog: FC<RightToForgottenDialogProps> = ({
    open,
    onOpenChange,
    onProceed,
}) => {
    const handleProceed = () => {
        onProceed();
        onOpenChange(false);
    };

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(details) => onOpenChange(details.open)}
            modal
        >
            <Dialog.Backdrop />
            <Dialog.Content
                position="fixed"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
            >
                <Dialog.Header fontSize="2xl">Invoke Right to Forgotten</Dialog.Header>
                <Dialog.Body>
                    <p>Customer has revoked his consent to use his/her data for training AI models</p>
                    <VStack gap={4} mt={4}>
                        <Button
                            colorPalette="red"
                            w="full"
                            onClick={handleProceed}
                        >
                            Proceed to remove data from Models
                        </Button>
                        <Button
                            variant="ghost"
                            textDecoration="underline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                    </VStack>
                </Dialog.Body>
            </Dialog.Content>
        </Dialog.Root>
    );
};