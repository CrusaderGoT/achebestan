"use client";

import { ActionIcon, Group } from "@mantine/core";
import {
    IconCheck,
    IconEdit,
    IconEditOff,
    IconMaximize,
    IconMinimize,
} from "@tabler/icons-react";

import publicStyles from "@/styles/public.module.css";
import { StoryPermissionsType } from "@/types/story";
import { useMounted } from "@mantine/hooks";
import cx from "clsx";

type StoryContentButtonsProps = {
    isFormSubmiting: boolean;
    openedContentField: boolean;
    dirty: boolean;
    toggleContentField: () => void;
    toggleFullscreen: () => Promise<void>;
    fullscreen: boolean;
    permissions?: StoryPermissionsType;
};

export function StoryContentButtons({
    isFormSubmiting,
    openedContentField,
    dirty,
    toggleContentField,
    toggleFullscreen,
    fullscreen,
    permissions,
}: StoryContentButtonsProps) {
    const mounted = useMounted();

    if (!mounted) return null;

    return (
        <Group gap={"xl"}>
            <>
                <ActionIcon
                    onClick={() => {
                        toggleContentField();
                    }}
                    title="Update Story Content"
                    variant="light"
                    color="yellow"
                    size="sm"
                    disabled={isFormSubmiting}
                    className={cx(!permissions?.canUpdate && publicStyles.hide)}
                >
                    {!openedContentField ? (
                        <IconEdit size={16} />
                    ) : (
                        <IconEditOff size={16} />
                    )}
                </ActionIcon>

                <ActionIcon
                    loading={isFormSubmiting}
                    title="Submit Update"
                    variant="light"
                    size={"sm"}
                    type="submit"
                    color="green"
                    className={cx(
                        (!openedContentField || !dirty) && publicStyles.hide
                    )}
                >
                    <IconCheck size={16} />
                </ActionIcon>
            </>

            <ActionIcon
                onClick={toggleFullscreen}
                ml={"auto"}
                variant="light"
                size={"sm"}
                color={fullscreen ? "red" : ""}
            >
                {fullscreen ? (
                    <IconMinimize size={16} />
                ) : (
                    <IconMaximize size={16} />
                )}
            </ActionIcon>
        </Group>
    );
}
