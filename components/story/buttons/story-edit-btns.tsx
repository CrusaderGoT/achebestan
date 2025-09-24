"use client";

import { ActionIcon, Group } from "@mantine/core";
import { IconCheck, IconEdit } from "@tabler/icons-react";

import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import cx from "clsx";

type StoryEditButtonsProps = {
    storyAuthorId: string;
    sessionUserId: string | undefined;
    isFormSubmiting: boolean;
    openedContentField: boolean;
    dirty: boolean;
    toggleContentField: () => void;
};

export function StoryEditButtons({
    storyAuthorId,
    sessionUserId,
    isFormSubmiting,
    openedContentField,
    dirty,
    toggleContentField,
}: StoryEditButtonsProps) {
    return (
        <Group
            justify="space-between"
            mb={"xs"}
            className={cx(
                storypageStyles.storyEditContentBtn,
                storyAuthorId !== sessionUserId && publicStyles.hide
            )}
        >
            <ActionIcon
                loading={isFormSubmiting}
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
                variant="light"
                color="yellow"
                size={"xs"}
                ml={"auto"}
                disabled={isFormSubmiting}
            >
                <IconEdit />
            </ActionIcon>
        </Group>
    );
}
