"use client";

import { ActionIcon, Group } from "@mantine/core";
import {
    IconCheck,
    IconEdit,
    IconMaximize,
    IconMinimize,
} from "@tabler/icons-react";

import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import cx from "clsx";

type StoryContentButtonsProps = {
    storyAuthorId: string;
    sessionUserId: string | undefined;
    isFormSubmiting: boolean;
    openedContentField: boolean;
    dirty: boolean;
    toggleContentField: () => void;
    toggleFullscreen: () => Promise<void>;
    fullscreen: boolean;
};

export function StoryContentButtons({
    storyAuthorId,
    sessionUserId,
    isFormSubmiting,
    openedContentField,
    dirty,
    toggleContentField,
    toggleFullscreen,
    fullscreen,
}: StoryContentButtonsProps) {
    return (
        <Group
            justify="flex-end"
            gap={"xl"}
            px={"md"}
            py={"xs"}
            className={cx(storypageStyles.storyEditContentBtn)}
        >
            {storyAuthorId === sessionUserId && (
                <>
                    <ActionIcon
                        onClick={() => {
                            toggleContentField();
                        }}
                        title="Update Story Content"
                        variant="light"
                        color="yellow"
                        size={"xs"}
                        disabled={isFormSubmiting}
                    >
                        <IconEdit />
                    </ActionIcon>

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
                </>
            )}

            <ActionIcon
                onClick={toggleFullscreen}
                ml={"auto"}
                variant="light"
                size={"xs"}
                color={fullscreen ? "red" : ""}
            >
                {fullscreen ? <IconMinimize /> : <IconMaximize />}
            </ActionIcon>
        </Group>
    );
}
