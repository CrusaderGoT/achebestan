import { StoryPageClient } from "@/components/story/story-page";
import { MetaTags } from "@/components/ui/meta-tags";
import { getBookStories } from "@/lib/actions/book";
import { readStoryComments } from "@/lib/actions/comment";
import { readLatestStoryISBNs, readStory } from "@/lib/actions/story";
import { getQueryClient } from "@/lib/get-query-client";
import { sanitizeHTML } from "@/lib/utils/sanitize-html";
import { generateStoryMetadata } from "@/lib/utils/story/generate-story-metadata";
import { storyJsonLdData } from "@/lib/utils/story/story-json-ld-data";
import { CommentTreeProps } from "@/types/comment";
import { StoryProps, StoryRatingProps } from "@/types/story";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";
import { connection } from "next/server";

export async function generateStaticParams() {
    const stories = await readLatestStoryISBNs();
    return stories?.map((story) => ({ isbn: story.isbn })) || [];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ isbn: string }>;
}): Promise<Metadata> {
    const { isbn } = await params;
    // Tip: Ensure `readStory` uses React.cache() to avoid a duplicate DB query
    const story = await readStory(isbn);
    return await generateStoryMetadata(story);
}

export default async function StoryPage({
    params,
}: {
    params: Promise<{ isbn: string }>;
}) {
    await connection();

    const { isbn } = await params;
    const queryClient = getQueryClient();

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ["read-story", { isbn }],
            queryFn: () => readStory(isbn),
        }),
        queryClient.prefetchQuery({
            queryKey: ["read-story-comments", { isbn }],
            queryFn: () => readStoryComments(isbn),
        }),
    ]);

    // Read prefetched data synchronously
    const story = queryClient.getQueryData<StoryProps & StoryRatingProps>([
        "read-story",
        { isbn },
    ]);

    const comments = queryClient.getQueryData<CommentTreeProps[]>([
        "read-story-comments",
        { isbn },
    ]);

    if (story?.bookId) {
        await queryClient.prefetchQuery({
            queryKey: ["book-stories", { bookId: story.bookId }],
            queryFn: () => getBookStories(story.bookId!),
        });
    }

    // Generate JSON-LD using the pre-fetched data
    const structuredData = story
        ? storyJsonLdData(story, comments || [])
        : null;

    return (
        <>
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHTML(JSON.stringify(structuredData)),
                    }}
                />
            )}

            <meta name="author" content={`${story?.author.name}`} />
            <MetaTags authorName={story?.author.name || ""} />

            <HydrationBoundary state={dehydrate(queryClient)}>
                <StoryPageClient isbn={isbn} />
            </HydrationBoundary>
        </>
    );
}
