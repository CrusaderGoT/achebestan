"use client";

import { authClient } from "@/lib/auth/auth-client";
import { ActionIcon, ActionIconProps } from "@mantine/core";

import { IconLockAccess, IconLockAccessOff } from "@tabler/icons-react";

type OpenAuthenticationModalButtonProps = {
    openModal: () => void;
    session: ReturnType<typeof authClient.useSession>;
} & ActionIconProps;

export function OpenAuthenticationModalButton({
    openModal,
    session,
    ...props
}: OpenAuthenticationModalButtonProps) {
    if (session.isPending) return null;

    return (
        <ActionIcon
            onClick={() => {
                openModal();
            }}
            size={"lg"}
            variant="subtle"
            color={session.data ? "green" : "red"}
            {...props}
        >
            {session.data ? (
                <IconLockAccess stroke={1.5} />
            ) : (
                <IconLockAccessOff stroke={1.5} />
            )}
        </ActionIcon>
    );
}
