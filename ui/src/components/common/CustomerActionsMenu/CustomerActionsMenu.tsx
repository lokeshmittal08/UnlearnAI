import type { FC } from 'react';
import { useState } from 'react';
import {
    Popover,
    IconButton,
    Button,
    HStack,
    Dialog,
    VStack,
} from '@chakra-ui/react';
import { MoreVertical, Hammer } from 'lucide-react';
import { customerService } from '@/services';
import { RightToForgottenDialog } from './RightToForgottenDialog';

interface CustomerActionsMenuProps {
    customerId: string;
    onInvokeRightToForgotten?: () => void;
}

export const CustomerActionsMenu: FC<CustomerActionsMenuProps> = ({
    customerId,
    onInvokeRightToForgotten,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleInvokeRightToForgotten = () => {
        setMenuOpen(false);
        setDialogOpen(true);
    };

    const handleProceed = async () => {
        setLoading(true);
        try {
            await customerService.triggerUnlearn(customerId);
            console.log('Successfully triggered unlearn for customer:', customerId);
            setDialogOpen(false);
            setSuccessDialogOpen(true);
            onInvokeRightToForgotten?.();
        } catch (error) {
            console.error('Failed to trigger unlearn:', error);
            // You might want to show an error toast here
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Popover.Root
                open={menuOpen}
                onOpenChange={(details) => setMenuOpen(details.open)}
                positioning={{ placement: 'bottom-end' }}
            >
                <Popover.Trigger asChild>
                    <IconButton
                        aria-label="Customer actions"
                        variant="ghost"
                        size="sm"
                        ml={2}
                    >
                        <MoreVertical size={16} />
                    </IconButton>
                </Popover.Trigger>
                <Popover.Positioner>
                    <Popover.Content w="280px">
                        <Popover.Body>
                            <Button
                                variant="ghost"
                                w="full"
                                justifyContent="flex-start"
                                onClick={handleInvokeRightToForgotten}
                            >
                                <HStack gap={2}>
                                    <Hammer size={16} />
                                    <span>Invoke Data Use Opt-Out</span>
                                </HStack>
                            </Button>
                        </Popover.Body>
                    </Popover.Content>
                </Popover.Positioner>
            </Popover.Root>

            <RightToForgottenDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onProceed={handleProceed}
                loading={loading}
            />

            <Dialog.Root
                open={successDialogOpen}
                onOpenChange={(details) => setSuccessDialogOpen(details.open)}
                modal
            >
                <Dialog.Backdrop />
                <Dialog.Content
                    position="fixed"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                >
                    <Dialog.Header fontSize="2xl">Success</Dialog.Header>
                    <Dialog.Body>
                        <p>The right to be forgotten has been successfully exercised. The customer’s data has been removed from the AI models.</p>
                        <VStack gap={4} mt={4}>
                            <Button
                                colorPalette="green"
                                w="full"
                                onClick={() => setSuccessDialogOpen(false)}
                            >
                                OK
                            </Button>
                        </VStack>
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Root>
        </>
    );
};