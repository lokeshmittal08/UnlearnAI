import type { FC } from 'react';
import { useState } from 'react';
import {
    Popover,
    IconButton,
    Button,
    HStack,
} from '@chakra-ui/react';
import { MoreVertical, Hammer } from 'lucide-react';
import { RightToForgottenDialog } from './RightToForgottenDialog';

interface CustomerActionsMenuProps {
    onInvokeRightToForgotten?: () => void;
}

export const CustomerActionsMenu: FC<CustomerActionsMenuProps> = ({
    onInvokeRightToForgotten,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleInvokeRightToForgotten = () => {
        setMenuOpen(false);
        setDialogOpen(true);
    };

    const handleProceed = () => {
        console.log('Proceeding to remove data from models');
        onInvokeRightToForgotten?.();
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
                                    <span>Invoke Right to Forgotten</span>
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
            />
        </>
    );
};