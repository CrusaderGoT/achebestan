import { CommentTree } from "@/components/comment/comment-tree";
import { StoryActions } from "@/components/story/story-actions";
import { Story } from "@/components/story/story-page";
import { StoryRating } from "@/components/story/story-rating";
import { readStoryComments } from "@/lib/actions/comment";
import { getUserRating } from "@/lib/actions/rating";
import { readStory } from "@/lib/actions/story";
import { auth } from "@/lib/auth/auth";
import { sanitizeHTML } from "@/lib/utils/sanitize-html";
import { generateStoryMetadata } from "@/lib/utils/story/generate-story-metadata";
import { storyJsonLdData } from "@/lib/utils/story/story-json-ld-data";
import { Center, Divider, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

dayjs.extend(relativeTime);

// Generate metadata for the story page
export async function generateMetadata({
    params,
}: {
    params: Promise<{ isbn: string }>;
}): Promise<Metadata> {
    const { isbn } = await params;

    // Fetch story data
    const story = await readStory(isbn);

    return await generateStoryMetadata(story);
}

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

    const structuredData = storyJsonLdData(story, comments);

    return (
        <>
            {/* JSON-LD Structured Data for Rich Snippets */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(
                        JSON.stringify(structuredData, null, 2)
                    ),
                }}
            />

            {/* Additional meta for personal brand */}
            <meta name="author" content={`${story.author.name}`} />

            <meta
                name="copyright"
                content={`© ${new Date().getFullYear()} ${
                    story.author.name
                } (Achebestan)`}
            />

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
                    blurb={story.blurb}
                />

                <StoryRating
                    ratings={story.ratings}
                    storyISBN={story.isbn}
                    userRating={userRating}
                />

                <StoryActions {...story} />

                <Divider
                    label={comments && comments.length > 0 ? "comments" : ""}
                />

                {comments && comments.length > 0 ? (
                    <CommentTree comments={comments} />
                ) : (
                    <Center>
                        <Text c={"dimmed"}>No Comments Yet...</Text>
                    </Center>
                )}
            </Stack>
        </>
    );
}
