"use client";

import { TextInput } from "@mantine/core";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

export function SecretLogin({
    secretValue,
    setSecretValue,
}: {
    secretValue: string;
    setSecretValue: Dispatch<SetStateAction<string>>;
}) {
    const pathname = usePathname();

    if (!pathname.startsWith("/stor")) return null;

    return (
        <TextInput
            value={secretValue}
            onChange={(e) => setSecretValue(e.currentTarget.value)}
        />
    );
}
