"use client";

import { authClient } from "@/lib/auth-client";
import { signupSchema, SignupSchemaType } from "@/zod-schemas/user";
import { Button, Divider, Group, Paper, Title } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { redirect } from "next/navigation";
import { useState } from "react";
import {
    SignupFields,
    SignupFormProvider,
    useSignupForm,
} from "./signup-form-context";

import { notifications } from "@mantine/notifications";
import { LoadingOverlayWithText } from "../ui/loading-overlay-with-text";

export function SignupForm() {
    const [formState, setFormState] = useState<
        "pending" | "success" | "idle" | "error"
    >("idle");

    const form = useSignupForm({
        mode: "uncontrolled",
        validate: zod4Resolver(signupSchema),
        validateInputOnBlur: true,
    });

    async function handleSubmit(data: SignupSchemaType) {
        await authClient.signUp.email(
            { ...data },
            {
                onRequest: () => setFormState("pending"),
                onError(errCtx) {
                    notifications.show({
                        message: `Error -> ${errCtx.error.message}`,
                        color: "red",
                    });
                    setFormState("error");
                },
                onSuccess() {
                    notifications.show({
                        message: "Successfully Signed Up",
                    });
                    setFormState("success");
                    redirect("/");
                },
            }
        );
    }

    return (
        <SignupFormProvider form={form}>
            <Paper withBorder p={"md"} pos={"relative"}>
                <Title order={3} ta={"center"} mb={"md"}>
                    Sign Up To Become A Writer!
                </Title>

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <SignupFields />

                    <Group justify="space-between" align="center" mt={"md"}>
                        <Button
                            type="submit"
                            loading={
                                formState === "pending" ||
                                formState === "success"
                            }
                            color="green"
                        >
                            Signup
                        </Button>

                        <Divider label="or" />

                        <Button
                            component="a"
                            href="/login"
                            loading={
                                formState === "pending" ||
                                formState === "success"
                            }
                            color="orange"
                        >
                            Login
                        </Button>
                    </Group>
                </form>

                <LoadingOverlayWithText
                    text={
                        formState === "pending"
                            ? "If Only It Was That Easy To Become A Writer. Anyway Signing Up New User"
                            : formState === "success"
                            ? "Redirecting To Home Page"
                            : ""
                    }
                    visible={formState === "pending" || formState === "success"}
                />
            </Paper>
        </SignupFormProvider>
    );
}
