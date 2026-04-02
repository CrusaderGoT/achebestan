import { StoryPageClient } from "@/components/story/story-page";
import { getBookStories } from "@/lib/actions/book";
import { readStoryComments } from "@/lib/actions/comment";
import { getUserRating } from "@/lib/actions/rating";
import { readLatestStories, readStory } from "@/lib/actions/story";
import { auth } from "@/lib/auth";
import { sanitizeHTML } from "@/lib/utils/sanitize-html";
import { generateStoryMetadata } from "@/lib/utils/story/generate-story-metadata";
import { storyJsonLdData } from "@/lib/utils/story/story-json-ld-data";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

dayjs.extend(relativeTime);

export async function generateStaticParams() {
    const stories = await readLatestStories(10);
    // params to prefetch latest stories
    return (
        stories?.map((story) => ({
            isbn: story.isbn,
        })) || []
    );
}

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

    const [userRating, book] = await Promise.all([
        getUserRating(session?.user.id, story.isbn),
        story.bookPart && story.bookId
            ? getBookStories(story.bookId, 0, story.bookPart * 5)
            : [],
    ]);

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

            <StoryPageClient
                story={story}
                comments={comments}
                userRating={userRating}
                book={book}
            />
        </>
    );
}
