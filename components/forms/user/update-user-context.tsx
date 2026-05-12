"use client";

import { createFormContext } from "@mantine/form";

import { UserUpdateType } from "@/types/user";
import { ImageDropzone, UploadImageDropZoneProps } from "../../ui/dropzone";

export const [
    UpdateUserFormProvider,
    useUpdateUserFormContext,
    useUpdateUserForm,
] = createFormContext<UserUpdateType>();

export function UpdateStoryFormFields({ ...props }: UploadImageDropZoneProps) {
    const form = useUpdateUserFormContext();

    return (
        <ImageDropzone
            aria-label="upload user image"
            key={form.key("image")}
            {...form.getInputProps("image")}
            action="uploadImage"
            maxFiles={1}
            {...props}
        />
    );
}
