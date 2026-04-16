import { ActionIcon, Tooltip } from "@mantine/core";
import { IconMessage2, IconMessage2Off } from "@tabler/icons-react";

export function CommentStory({
    toggle,
    openAuthModal,
    userId,
    opened,
}: {
    toggle: () => void;
    openAuthModal: () => void;
    userId: string | undefined;
    opened: boolean;
}) {
    return (
        <Tooltip
            label={opened ? "Close Comment" : "Comment"}
            withArrow
            position="top"
        >
            <ActionIcon
                onClick={() => {
                    if (!userId) {
                        openAuthModal();
                    } else {
                        toggle();
                    }
                }}
                variant="transparent"
                color="gray"
                size="lg"
                radius="xl"
                aria-label={"Comment on this story"}
            >
                {opened ? (
                    <IconMessage2Off size={24} stroke={1.5} />
                ) : (
                    <IconMessage2 size={24} stroke={1.5} />
                )}
            </ActionIcon>
        </Tooltip>
    );
}
