"use client";

import { createFormContext } from "@mantine/form";

import { LoginSchemaType } from "@/types/user";
import { PasswordInput, Stack, TextInput } from "@mantine/core";
import { IconAt, IconLockPassword } from "@tabler/icons-react";

export const [LoginFormProvider, useLoginFormContext, useLoginForm] =
    createFormContext<LoginSchemaType>();

export function LoginFields() {
    const form = useLoginFormContext();

    return (
        <Stack>
            <TextInput
                type="email"
                key={form.key("email")}
                {...form.getInputProps("email")}
                label="Email"
                leftSection={<IconAt />}
            />

            <PasswordInput
                key={form.key("password")}
                {...form.getInputProps("password")}
                label="password"
                leftSection={<IconLockPassword />}
            />
        </Stack>
    );
}
