"use client";

import { authClient } from "@/lib/auth-client";
import { signupSchema, SignupSchemaType } from "@/zod-schemas/user";
import { Button, Stack, Title } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { redirect } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import {
    SignupFields,
    SignupFormProvider,
    useSignupForm,
} from "./signup-form-context";

import { LoginFormState } from "@/types/user";
import { notifications } from "@mantine/notifications";
import { LoadingOverlayWithText } from "../../ui/loading-overlay-with-text";

import publicStyles from "@/styles/public.module.css";

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
        await authClient.signUp.email(
            { ...data },
            {
                onRequest: () => setFormState("pending"),
                onError() {
                    notifications.show({
                        message: `Error Signing Up`,
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
                    } else {
                        // clear success state to remove overlay
                        setFormState("idle");
                    }
                },
            }
        );
    }

    return (
        <SignupFormProvider form={form}>
            <Stack>
                <Title order={5} className={publicStyles.title}>
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
            </Stack>
        </SignupFormProvider>
    );
}
