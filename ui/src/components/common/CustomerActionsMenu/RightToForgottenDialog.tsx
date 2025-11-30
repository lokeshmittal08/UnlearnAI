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
    loading?: boolean;
}

export const RightToForgottenDialog: FC<RightToForgottenDialogProps> = ({
    open,
    onOpenChange,
    onProceed,
    loading = false,
}) => {
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
                    <p>The customer has revoked his/her consent for their data to be used for training AI models.</p>
                    <VStack gap={4} mt={4}>
                        <Button
                            colorPalette="red"
                            w="full"
                            onClick={onProceed}
                            loading={loading}
                        >
                            Remove data from models
                        </Button>
                        <Button
                            variant="ghost"
                            textDecoration="underline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </VStack>
                </Dialog.Body>
            </Dialog.Content>
        </Dialog.Root>
    );
};