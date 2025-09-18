"use client";

import { UpdateStoryTitle } from "@/components/forms/story/update-story-form-context";
import { StoryUpdateType } from "@/zod-schemas/story";
import { ActionIcon, Box, Group, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconCheck, IconPencilMinus } from "@tabler/icons-react";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import cx from "clsx";

type StoryTitleType = {
    openedTitleField: boolean;
    title: string;
    isPending: boolean;
    toggleTitleField: () => void;
    form: UseFormReturnType<StoryUpdateType>;
    session: ReturnType<typeof authClient.useSession>;
    storyAuthorId: string;
};

export function StoryTitle({
    title,
    openedTitleField,
    isPending,
    toggleTitleField,
    form,
    session,
    storyAuthorId,
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

            <Group
                className={cx(
                    storyAuthorId !== session.data?.user.id && publicStyles.hide
                )}
            >
                <ActionIcon
                    onClick={() => {
                        toggleTitleField();
                        form.resetField("title");
                    }}
                    title="Update Story Title"
                    color="yellow"
                    size={"xs"}
                    variant="subtle"
                    disabled={isPending}
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
