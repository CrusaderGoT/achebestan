"use client";

import { authClient } from "@/lib/auth-client";
import { signupSchema, SignupSchemaType } from "@/zod-schemas/user";
import { Button, Paper, Stack, Title } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { redirect } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import {
    SignupFields,
    SignupFormProvider,
    useSignupForm,
} from "./signup-form-context";

import { LoginFormState } from "@/lib/types/login";
import { notifications } from "@mantine/notifications";
import { LoadingOverlayWithText } from "../../ui/loading-overlay-with-text";

export function SignupForm({
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
    const form = useSignupForm({
        mode: "uncontrolled",
        validate: zod4Resolver(signupSchema),
        validateInputOnBlur: true,
    });

    async function handleSubmit(data: SignupSchemaType) {
        await authClient.admin.createUser(
            { ...data, role: "user" },
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
        <SignupFormProvider form={form}>
            <Paper withBorder p={"md"} pos={"relative"}>
                <Title order={3} ta={"center"} mb={"md"}>
                    Sign Up To Become A Writer!
                </Title>

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <SignupFields />

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
                    </Stack>
                </form>

                <LoadingOverlayWithText
                    text={
                        formState === "pending"
                            ? "If Only It Was That Easy To Become A Writer. Anyway Signing Up New User"
                            : formState === "success" && redirectAfterSuccess
                            ? "Redirecting To Home Page"
                            : ""
                    }
                    visible={formState === "pending" || formState === "success"}
                />
            </Paper>
        </SignupFormProvider>
    );
}
