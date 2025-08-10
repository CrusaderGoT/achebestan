import { StoryUpdateType } from "@/zod-schemas/story";
import { Box, Button } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useState } from "react";
import { StoryImageDropzone } from "../ui/dropzone";

import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import cx from "clsx";
import { authClient } from "@/lib/auth-client";

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
        setImage(value.length > 0);
    });

    return (
        <Box
            className={cx(
                storypageStyles.storyImageFieldBox,
                openedImageField ? publicStyles.show : publicStyles.hide
            )}
            hidden={storyAuthorId !== session.data?.user.id}
        >
            <StoryImageDropzone
                maxFiles={1}
                form={form}
                action="update"
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
