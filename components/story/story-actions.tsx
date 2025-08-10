import { ActionIcon, Group } from "@mantine/core";
import {
    IconBubble,
    IconCurrencyDollar,
    IconHeart,
    IconShare2,
    IconThumbUpFilled,
} from "@tabler/icons-react";
import { DeleteStory } from "./delete-story";

type StoryActionsProps = {
    isbn: string;
    storyTitle: string;
    authorId: string;
};

export function StoryActions({
    isbn,
    storyTitle,
    authorId,
}: StoryActionsProps) {
    return (
        <Group>
            <LikeButton />

            <IconHeart />
            <IconBubble />
            <IconCurrencyDollar />
            <IconShare2 />

            <DeleteStory
                isbn={isbn}
                storyTitle={storyTitle}
                authorId={authorId}
            />
        </Group>
    );
}

function LikeButton() {
    return (
        <ActionIcon.Group>
            <ActionIcon>
                <IconThumbUpFilled />
            </ActionIcon>
            <ActionIcon.GroupSection>{33}</ActionIcon.GroupSection>
        </ActionIcon.Group>
    );
}
