import { UpdateStoryContent } from "@/components/forms/story/update-story-form-context";
import { StoryUpdateType } from "@/zod-schemas/story";
import { ActionIcon, Box, Group, ScrollArea } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconCheck, IconEdit } from "@tabler/icons-react";

import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import cx from "clsx";

type StoryContentType = {
    toggleContentField: () => void;
    openedContentField: boolean;
    content: string;
    form: UseFormReturnType<StoryUpdateType>;
};

export function StoryContent({
    toggleContentField,
    openedContentField,
    content,
    form,
}: StoryContentType) {
    return (
        <Box>
            <Group justify="space-between" mb={"xs"}>
                <ActionIcon
                    onClick={() => toggleContentField()}
                    title="Submit Update"
                    variant="light"
                    size={"xs"}
                    type="submit"
                    color="green"
                    className={cx(!openedContentField && publicStyles.hide)}
                >
                    <IconCheck />
                </ActionIcon>

                <ActionIcon
                    onClick={() => {
                        toggleContentField();
                        form.resetField("content");
                    }}
                    title="Update Story Content"
                    variant="subtle"
                    color="yellow"
                    size={"xs"}
                    ml={"auto"}
                >
                    <IconEdit />
                </ActionIcon>
            </Group>

            {/**Do not use  ScrollAreaAutosize; it causes both content and content field to appear at the same time*/}
            <ScrollArea
                className={cx(
                    storypageStyles.storyContent,
                    openedContentField && publicStyles.hide
                )}
                offsetScrollbars="present"
            >
                <Box
                    dangerouslySetInnerHTML={{
                        __html: content,
                    }}
                    className={publicStyles.forceWrapText}
                />
            </ScrollArea>

            <Box className={cx(!openedContentField && publicStyles.hide)}>
                <UpdateStoryContent />
            </Box>
        </Box>
    );
}
