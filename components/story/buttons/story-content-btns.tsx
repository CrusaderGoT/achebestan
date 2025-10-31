

import { ActionIcon, Group } from "@mantine/core";
import {
    IconCheck,
    IconEdit,
    IconEditOff,
    IconMaximize,
    IconMinimize,
} from "@tabler/icons-react";

import publicStyles from "@/styles/public.module.css";
import { useMounted } from "@mantine/hooks";
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
    const mounted = useMounted();

    if (!mounted) return null;

    return (
        <Group gap={"xl"}>
            {storyAuthorId === sessionUserId && (
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
            )}

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
