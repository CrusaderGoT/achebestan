import { HomePage } from "@/components/home/homepage";
import { readLatestStories } from "@/lib/actions/story";
import { generateHomeMetadata } from "@/lib/utils/home/generate-home-metadata";
import { homeJsonLdData } from "@/lib/utils/home/home-json-ld-data";
import { sanitizeHTML } from "@/lib/utils/sanitize-html";
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

    // Fetch latest stories for dynamic content
    const stories = await readLatestStories(10);

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

            <HomePage stories={stories} />
        </>
    );
}
