// app/sitemap.ts
import { readLatestStorySiteMap } from "@/lib/actions/story";
import { BASE_URL } from "@/lib/constants";
import type { MetadataRoute } from "next";

// Force dynamic execution if stories change constantly,
// or leverage Next.js caching revalidate options if appropriate
export const revalidate = 3600; // Revalidate at most every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Define Root/Static Pages
    const rootSiteMap: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0, // Absolute top priority
            images: [`${BASE_URL}/images/iq_detailed.png`],
        },
    ];

    try {
        // 2. Fetch Dynamic Story Records
        const latestStories = await readLatestStorySiteMap();

        if (!latestStories || latestStories.length === 0) {
            return rootSiteMap;
        }

        // 3. Map Dynamic Records to Sitemap format
        const latestStoriesSiteMap: MetadataRoute.Sitemap = latestStories.map(
            (story) => {
                // Ensure we have a valid ISO date string
                const rawDate = story.edited || story.created;
                const lastModified = rawDate ? new Date(rawDate) : new Date();

                return {
                    url: `${BASE_URL}/stories/${story.isbn}`,
                    lastModified,
                    changeFrequency: "weekly",
                    priority: 0.8, // Slightly lower than homepage so engines understand site hierarchy
                    ...(story.image ? { images: [story.image] } : {}),
                };
            },
        );

        return [...rootSiteMap, ...latestStoriesSiteMap];
    } catch (error) {
        console.error("Failed to generate stories sitemap:", error);
        // Fallback to root sitemap gracefully to avoid crashing the build/endpoint
        return rootSiteMap;
    }
}
