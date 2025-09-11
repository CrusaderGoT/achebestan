"use client";

import { ActionIcon, ActionIconProps } from "@mantine/core";

import { IconLogin2 } from "@tabler/icons-react";

type LoginButtonType = {
    openLoginModal: () => void;
} & ActionIconProps;

export function LoginButton({ openLoginModal, ...props }: LoginButtonType) {
    return (
        <ActionIcon
            onClick={() => {
                openLoginModal();
            }}
            color="teal"
            size={"lg"}
            variant="subtle"
            {...props}
        >
            <IconLogin2 />
        </ActionIcon>
    );
}
