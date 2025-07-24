"use client";

import { signupSchema, SignupSchemaType } from "@/zod-schemas/user";
import { Button, Paper } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
    SignupFields,
    SignupFormProvider,
    useSignupForm,
} from "./signup-form-context";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { redirect } from "next/navigation";

export function SignupForm() {
    const [loading, setLoading] = useState(false);

    const form = useSignupForm({
        mode: "uncontrolled",
        validate: zod4Resolver(signupSchema),
        validateInputOnBlur: true,
    });

    async function handleSubmit(data: SignupSchemaType) {
        await authClient.signUp.email(
            { ...data },
            {
                onRequest: () => setLoading(true),
                onError(context) {
                    setLoading(false);
                    alert(context.error.cause);
                },
                onSuccess() {
                    // notify
                    alert("successful");
                    redirect("/");
                },
            }
        );
    }

    return (
        <SignupFormProvider form={form}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Paper withBorder p={"md"}>
                    <SignupFields />

                    <Button type="submit" loading={loading}>
                        Signup
                    </Button>
                </Paper>
            </form>
        </SignupFormProvider>
    );
}
