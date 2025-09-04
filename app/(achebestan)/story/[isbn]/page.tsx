import { CommentTree } from "@/components/comment/comment-tree";
import { CommentForm } from "@/components/forms/comment/comment-form";
import { Story } from "@/components/story/story-page";
import { StoryRating } from "@/components/story/story-rating";
import { readStoryComments } from "@/lib/actions/comment";
import { getUserRating } from "@/lib/actions/rating";
import { readStory } from "@/lib/actions/story";
import { auth } from "@/lib/auth";
import { Divider, Stack } from "@mantine/core";
import { headers } from "next/headers";

import { notFound } from "next/navigation";

export default async function StoryPage({
    params,
}: {
    params: Promise<{ isbn: string }>;
}) {
    const { isbn } = await params;

    const [session, story, comments] = await Promise.all([
        auth.api.getSession({
            headers: await headers(),
        }),
        readStory(isbn),
        readStoryComments(isbn),
    ]);

    if (!story) notFound();

    const userRating = await getUserRating(session?.user.id, story.isbn);

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

            <StoryRating
                ratings={story.ratings}
                storyISBN={story.isbn}
                userRating={userRating}
                userId={session?.user.id}
            />

            <Divider />

            <CommentForm storyISBN={story.isbn} text="" />

            <Divider />

            {comments ? <CommentTree comments={comments} /> : null}
        </Stack>
    );
}
