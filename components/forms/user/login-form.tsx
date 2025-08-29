"use client";

import { authClient } from "@/lib/auth-client";
import { LoginSchemaType, loginSchema } from "@/zod-schemas/user";
import { Button, Divider, Group, Paper, Title } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { redirect } from "next/navigation";
import { useState } from "react";
import {
    LoginFields,
    LoginFormProvider,
    useLoginForm,
} from "./login-form-context";

import { notifications } from "@mantine/notifications";
import { LoadingOverlayWithText } from "../../ui/loading-overlay-with-text";

export function LoginForm({
    redirectAfterSuccess = true,
    closeModal,
}: {
    redirectAfterSuccess?: boolean;
    closeModal?: () => void;
}) {
    const [formState, setFormState] = useState<
        "pending" | "success" | "idle" | "error"
    >("idle");

    const form = useLoginForm({
        mode: "uncontrolled",
        validate: zod4Resolver(loginSchema),
        validateInputOnBlur: true,
    });

    async function handleSubmit(data: LoginSchemaType) {
        await authClient.signIn.email(
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
                        message: "Successfully Logged In",
                    });
                    setFormState("success");

                    if (closeModal) {
                        closeModal();
                    }

                    if (redirectAfterSuccess) {
                        redirect("/");
                    }
                },
            }
        );
    }

    return (
        <LoginFormProvider form={form}>
            <Paper withBorder p={"md"} pos={"relative"}>
                <Title order={3} ta={"center"} mb={"md"}>
                    Log In To Make Edits!
                </Title>

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <LoginFields />

                    <Group justify="space-between" align="center" mt={"md"}>
                        <Button
                            type="submit"
                            loading={
                                formState === "pending" ||
                                formState === "success"
                            }
                            color="orange"
                        >
                            Login
                        </Button>

                        <Divider label="or" />

                        <Button
                            component="a"
                            href="/signup"
                            loading={
                                formState === "pending" ||
                                formState === "success"
                            }
                            color="green"
                        >
                            Signup
                        </Button>
                    </Group>
                </form>

                <LoadingOverlayWithText
                    text={
                        formState === "pending"
                            ? "Logging You In. Write A New Story Today"
                            : formState === "success" && redirectAfterSuccess
                            ? "Redirecting To Home Page"
                            : ""
                    }
                    visible={formState === "pending" || formState === "success"}
                />
            </Paper>
        </LoginFormProvider>
    );
}
