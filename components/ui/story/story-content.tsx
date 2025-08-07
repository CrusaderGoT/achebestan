import { UpdateStoryContent } from "@/components/forms/story/update-story-form-context";
import { StoryUpdateType } from "@/zod-schemas/story";
import { ActionIcon, Box, Group, ScrollArea } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconCheck, IconEdit } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { sanitizeHTML } from "@/lib/utils/sanitize-html";
import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import cx from "clsx";
import { useState } from "react";

type StoryContentType = {
    toggleContentField: () => void;
    openedContentField: boolean;
    content: string;
    form: UseFormReturnType<StoryUpdateType>;
    session: ReturnType<typeof authClient.useSession>;
    storyAuthorId: string;
};

export function StoryContent({
    toggleContentField,
    openedContentField,
    content,
    form,
    session,
    storyAuthorId,
}: StoryContentType) {
    const [dirty, setDirty] = useState(false);

    form.watch("content", ({ dirty }) => {
        setDirty(dirty);
    });

    return (
        <Box>
            <Group
                justify="space-between"
                mb={"xs"}
                className={cx(
                    storyAuthorId !== session.data?.user.id && publicStyles.hide
                )}
            >
                <ActionIcon
                    loading={form.submitting}
                    title="Submit Update"
                    variant="light"
                    size={"xs"}
                    type="submit"
                    color="green"
                    className={cx(
                        (!openedContentField || !dirty) && publicStyles.hide
                    )}
                >
                    <IconCheck />
                </ActionIcon>

                <ActionIcon
                    onClick={() => {
                        toggleContentField();
                    }}
                    title="Update Story Content"
                    variant="subtle"
                    color="yellow"
                    size={"xs"}
                    ml={"auto"}
                    disabled={form.submitting}
                >
                    <IconEdit />
                </ActionIcon>
            </Group>

            {/**Do not use  ScrollAreaAutosize; it causes both content and content field to appear at the same time*/}
            <ScrollArea
                className={cx(
                    storypageStyles.storyContentScrollArea,
                    openedContentField && publicStyles.hide
                )}
                offsetScrollbars="present"
            >
                <Box
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHTML(content),
                    }}
                    className={cx(
                        storypageStyles.storyContent
                    )}
                />
            </ScrollArea>

            <Box
                className={cx(
                    (!openedContentField ||
                        storyAuthorId !== session.data?.user.id) &&
                        publicStyles.hide
                )}
            >
                <UpdateStoryContent />
            </Box>
        </Box>
    );
}
