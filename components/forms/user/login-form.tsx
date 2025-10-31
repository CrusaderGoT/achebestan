"use client";

import { authClient } from "@/lib/auth-client";
import { LoginSchemaType, loginSchema } from "@/zod-schemas/user";
import { Button, Stack, Title } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { redirect } from "next/navigation";
import {
    LoginFields,
    LoginFormProvider,
    useLoginForm,
} from "./login-form-context";

import { LoginFormState } from "@/types/user";
import { notifications } from "@mantine/notifications";
import { Dispatch, SetStateAction } from "react";
import { LoadingOverlayWithText } from "../../ui/loading-overlay-with-text";

import publicStyles from "@/styles/public.module.css";

export function LoginForm({
    redirectAfterSuccess = true,
    closeModal,
    formState,
    setFormState,
}: {
    redirectAfterSuccess?: boolean;
    closeModal?: () => void;
    formState: LoginFormState;
    setFormState: Dispatch<SetStateAction<LoginFormState>>;
}) {
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
                    } else {
                        // clear success state to remove overlay
                        setFormState("idle");
                    }
                },
            }
        );
    }

    return (
        <LoginFormProvider form={form}>
            <Stack>
                <Title order={5} className={publicStyles.title}>
                    Log In To Make Edits!
                </Title>

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <LoginFields />

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
                    </Stack>
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
            </Stack>
        </LoginFormProvider>
    );
}
