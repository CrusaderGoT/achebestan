

import { createFormContext } from "@mantine/form";

import { SignupSchemaType } from "@/zod-schemas/user";
import { PasswordInput, Stack, TextInput } from "@mantine/core";
import { IconAt, IconLockPassword, IconUser } from "@tabler/icons-react";

export const [SignupFormProvider, useSignupFormContext, useSignupForm] =
    createFormContext<SignupSchemaType>();

export function SignupFields() {
    const form = useSignupFormContext();

    return (
        <Stack>
            <TextInput
                type="email"
                key={form.key("email")}
                {...form.getInputProps("email")}
                label="Email"
                leftSection={<IconAt />}
                autoComplete="off"
            />

            <TextInput
                key={form.key("name")}
                {...form.getInputProps("name")}
                label="name"
                leftSection={<IconUser />}
                autoComplete="off"
            />

            <PasswordInput
                key={form.key("password")}
                {...form.getInputProps("password")}
                label="password"
                leftSection={<IconLockPassword />}
                autoComplete="off"
            />
        </Stack>
    );
}
