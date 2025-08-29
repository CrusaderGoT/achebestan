"use client";

import { ActionIcon } from "@mantine/core";

import { IconLogin2 } from "@tabler/icons-react";

import { useRouter } from "next/navigation";

type LoginButtonType =
    | { gotoLoginPage: true; toggleLoginModal?: never }
    | { gotoLoginPage?: never; toggleLoginModal: () => void };

export function LoginButton({
    gotoLoginPage,
    toggleLoginModal: openLoginModal,
}: LoginButtonType) {
    const router = useRouter();

    return (
        <ActionIcon
            onClick={() => {
                if (gotoLoginPage || !openLoginModal) {
                    router.push("/login");
                } else {
                    openLoginModal();
                }
            }}
            color="teal"
            size={"lg"}
            variant="subtle"
        >
            <IconLogin2 />
        </ActionIcon>
    );
}
