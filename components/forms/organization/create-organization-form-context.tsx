"use client";

import { OrganizationInsertSchemaType } from "@/zod-schemas/organization";
import { Textarea, TextInput } from "@mantine/core";
import { createFormContext } from "@mantine/form";
import { IconBuildingCommunity } from "@tabler/icons-react";

export const [
    OrganizationFormProvider,
    useOrganizationFormContext,
    useOrganizationForm,
] = createFormContext<OrganizationInsertSchemaType>();

export function OrganizationFormFields() {
    const form = useOrganizationFormContext();

    return (
        <>
            <TextInput
                key={form.key("name")}
                {...form.getInputProps("name")}
                label="Name"
                description="The organization name"
                leftSection={<IconBuildingCommunity />}
                autoComplete="off"
                placeholder="achebestan"
            />

            <TextInput
                key={form.key("slug")}
                {...form.getInputProps("slug")}
                label="Slug"
                description="The organization slug"
                leftSection={<IconBuildingCommunity />}
                autoComplete="off"
                placeholder="achebe-stan"
            />

            {/** Add Image DropZone Later */}

            <Textarea
                key={form.key("metadata")}
                {...form.getInputProps("metadata")}
                label="Description"
                description="The organization description"
                maxRows={5}
                minRows={5}
            />
        </>
    );
}
