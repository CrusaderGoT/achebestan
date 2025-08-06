"use client";

import { ActionIcon } from "@mantine/core";

import { IconLogin } from "@tabler/icons-react";

import { useRouter } from "next/navigation";

export function LoginButton() {
    const router = useRouter();

    return (
        <ActionIcon
            onClick={() => router.push("/login")}
            color="orange"
            size={"lg"}
            variant="subtle"
        >
            <IconLogin />
        </ActionIcon>
    );
}
