import { DeleteStory } from "@/components/ui/story/delete-story";
import { Story } from "@/components/ui/story/story-page";
import { readStory } from "@/lib/actions/story";
import { Group, Stack } from "@mantine/core";
import {
    IconBubble,
    IconCurrencyDollar,
    IconHeart,
    IconShare2,
} from "@tabler/icons-react";

import { notFound } from "next/navigation";

export default async function StoryPage({
    params,
}: {
    params: Promise<{ isbn: string }>;
}) {
    const { isbn } = await params;

    const story = await readStory(isbn);

    if (!story) notFound();

    return (
        <Stack>
            <Story
                image={story.image}
                title={story.title}
                author={story.author}
                content={story.content}
                created={story.created}
                edited={story.edited}
                id={story.id}
                isbn={story.isbn}
                authorId={story.authorId}
                subtitle={story.subtitle}
                bookId={story.bookId}
            />

            <Group>
                <IconHeart />
                <IconBubble />
                <IconCurrencyDollar />
                <IconShare2 />

                <DeleteStory
                    isbn={story.isbn}
                    storyTitle={story.title}
                    authorId={story.authorId}
                />
            </Group>
        </Stack>
    );
}
