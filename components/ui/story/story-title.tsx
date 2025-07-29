import { UpdateStoryTitle } from "@/components/forms/story/update-story-form-context";
import { StoryUpdateType } from "@/zod-schemas/story";
import { ActionIcon, Box, Group, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconCheck, IconPencilMinus } from "@tabler/icons-react";
import { useState } from "react";

import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import cx from "clsx";

type StoryTitleType = {
    openedTitleField: boolean;
    title: string;
    isPending: boolean;
    toggleTitleField: () => void;

    form: UseFormReturnType<StoryUpdateType>;
};

export function StoryTitle({
    title,
    openedTitleField,
    isPending,
    toggleTitleField,
    form,
}: StoryTitleType) {
    const [dirty, setDirty] = useState(false);

    form.watch("title", ({ dirty }) => {
        setDirty(dirty);
    });

    return (
        <Group>
            <Box>
                <Title
                    className={cx(
                        storypageStyles.storyTitle,
                        openedTitleField && publicStyles.hide
                    )}
                >
                    {title}
                </Title>

                <UpdateStoryTitle
                    className={cx(!openedTitleField && publicStyles.hide)}
                    label=""
                    disabled={isPending || !openedTitleField}
                    size="md"
                />
            </Box>

            <Group>
                <ActionIcon
                    onClick={() => {
                        toggleTitleField();
                        form.resetField("title");
                    }}
                    title="Update Story Title"
                    color="yellow"
                    size={"xs"}
                    variant="subtle"
                >
                    <IconPencilMinus />
                </ActionIcon>

                {dirty && openedTitleField && (
                    <ActionIcon
                        size="xs"
                        type="submit"
                        loading={isPending}
                        color="green"
                    >
                        <IconCheck />
                    </ActionIcon>
                )}
            </Group>
        </Group>
    );
}
