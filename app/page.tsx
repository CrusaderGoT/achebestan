import { HomePage } from "@/components/home/home-page";
import { readStoryComments } from "@/lib/actions/comment";
import { readLatestStories, readStory } from "@/lib/actions/story";
import { getQueryClient } from "@/lib/get-query-client";
import { generateHomeMetadata } from "@/lib/utils/home/generate-home-metadata";
import { homeJsonLdData } from "@/lib/utils/home/home-json-ld-data";
import { sanitizeHTML } from "@/lib/utils/sanitize-html";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";
import { connection } from "next/server";

// Generate metadata for homepage
export async function generateMetadata(): Promise<Metadata> {
    // Fetch latest stories for dynamic content
    const stories = await readLatestStories(10);
    return generateHomeMetadata(stories);
}

export default async function Home() {
    await connection();

    const queryClient = getQueryClient();

    // Fetch latest stories for dynamic content
    const stories = await readLatestStories(10);

    if (stories && stories.length > 0) {
        // Prefetch all story + comment queries in parallel
        await Promise.all(
            stories.flatMap((story) => [
                queryClient.prefetchQuery({
                    queryKey: ["read-story", { isbn: story.isbn }],
                    queryFn: () => readStory(story.isbn),
                }),
                queryClient.prefetchQuery({
                    queryKey: ["read-story-comments", { isbn: story.isbn }],
                    queryFn: () => readStoryComments(story.isbn),
                }),
            ]),
        );
    }

    // Generate structured data
    const structuredData = await homeJsonLdData(stories);

    return (
        <>
            {/* JSON-LD Structured Data for Rich Snippets */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(
                        JSON.stringify(structuredData, null, 2),
                    ),
                }}
            />

            {/* Preload hero image for better performance */}
            <link rel="preload" href="/images/iq_detailed.png" as="image" />

            <HydrationBoundary state={dehydrate(queryClient)}>
                <HomePage stories={stories} />
            </HydrationBoundary>
        </>
    );
}
