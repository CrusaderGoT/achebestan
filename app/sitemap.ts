import { readLatestStories } from "@/lib/actions/story";
import { BASE_URL } from "@/lib/constants";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Google's limit is 50,000 URLs per sitemap

    const rootSiteMap: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
            images: [`${BASE_URL}/images/iq_detailed.png`],
        },
    ];

    const latestStories = await readLatestStories();

    if (!latestStories || latestStories.length < 1) {
        return rootSiteMap;
    }

    const latestStoriesSiteMap: MetadataRoute.Sitemap = latestStories.map(
        (story) => ({
            url: `${BASE_URL}/story/${story.isbn}`,
            lastModified: story.edited || story.created,
            changeFrequency: "always",
            priority: 1.0,
            ...(story.image ? { images: [story.image] } : {}),
        })
    );

    return [...rootSiteMap, ...latestStoriesSiteMap];
}
