import { StoryUpdateType } from "@/zod-schemas/story";
import { Box, Button } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useState } from "react";
import { StoryImageDropzone } from "../dropzone";

import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import cx from "clsx";

type StoryImageFieldType = {
    openedImageField: boolean;
    isPending: boolean;
    form: UseFormReturnType<StoryUpdateType>;
};

export function StoryImageField({
    openedImageField,
    isPending,
    form,
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
