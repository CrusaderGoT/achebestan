"use client";

import { authClient } from "@/lib/auth/auth-client";

import { Button, Paper, Stack, Title } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { redirect } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

import { LoginFormState } from "@/types/user";
import {
    organizationInsertSchema,
    OrganizationInsertSchemaType,
} from "@/zod-schemas/organization";
import { notifications } from "@mantine/notifications";
import { LoadingOverlayWithText } from "../../ui/loading-overlay-with-text";
import {
    OrganizationFormFields,
    OrganizationFormProvider,
    useOrganizationForm,
} from "./create-organization-form-context";

export function OrganizationCreateForm({
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
    const form = useOrganizationForm({
        mode: "uncontrolled",
        validate: zod4Resolver(organizationInsertSchema),
        validateInputOnBlur: true,
    });

    async function handleSubmit(formData: OrganizationInsertSchemaType) {
        await authClient.organization.create(
            {
                ...formData,
                keepCurrentActiveOrganization: false,
            },
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
        <OrganizationFormProvider form={form}>
            <Paper withBorder p={"md"}>
                <Title order={3} ta={"center"} mb={"md"}>
                    Sign Up To Become A Writer!
                </Title>

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <OrganizationFormFields />

                        <Button
                            type="submit"
                            loading={
                                formState === "pending" ||
                                formState === "success"
                            }
                            color="green"
                        >
                            Create
                        </Button>
                    </Stack>
                </form>

                <LoadingOverlayWithText
                    text={
                        formState === "pending"
                            ? "Create New Organization"
                            : formState === "success" && redirectAfterSuccess
                            ? "Redirecting To Home Page"
                            : ""
                    }
                    visible={formState === "pending" || formState === "success"}
                />
            </Paper>
        </OrganizationFormProvider>
    );
}
