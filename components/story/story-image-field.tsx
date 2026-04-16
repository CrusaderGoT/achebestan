"use client";

import { StoryUpdateType } from "@/types/story";
import { Box, Button } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useState } from "react";
import { ImageDropzone } from "../ui/dropzone";

import { authClient } from "@/lib/auth-client";
import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story/story-page.module.css";
import cx from "clsx";

type StoryImageFieldType = {
    openedImageField: boolean;
    isPending: boolean;
    form: UseFormReturnType<StoryUpdateType>;
    session: ReturnType<typeof authClient.useSession>;
    storyAuthorId: string;
};

export function StoryImageField({
    openedImageField,
    isPending,
    form,
    session,
    storyAuthorId,
}: StoryImageFieldType) {
    const [image, setImage] = useState(false);

    form.watch("image", ({ value }) => {
        setImage(!!value);
    });

    return (
        <Box
            className={cx(
                storypageStyles.storyImageFieldBox,
                storypageStyles.storyImage,
                openedImageField ? publicStyles.show : publicStyles.hide,
            )}
            hidden={storyAuthorId !== session.data?.user.id}
        >
            <ImageDropzone
                maxFiles={1}
                form={form}
                action="updateStory"
                field="image"
            />

            {image && (
                <Button
                    size="compact-sm"
                    mt={"sm"}
                    type="submit"
                    loading={isPending}
                >
                    upload
                </Button>
            )}
        </Box>
    );
}
