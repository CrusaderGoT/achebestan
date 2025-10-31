import { ActionIcon, ActionIconProps } from "@mantine/core";

import { IconLockAccess } from "@tabler/icons-react";

type OpenAuthenticationModalButtonProps = {
    openModal: () => void;
} & ActionIconProps;

export function OpenAuthenticationModalButton({
    openModal,
    ...props
}: OpenAuthenticationModalButtonProps) {
    return (
        <ActionIcon
            onClick={() => {
                openModal();
            }}
            color="teal"
            size={"lg"}
            variant="subtle"
            {...props}
        >
            <IconLockAccess />
        </ActionIcon>
    );
}
