import { BASE_URL } from "@/lib/constants";
import { StoryProps } from "@/types/story";
import { RatingSelectType } from "@/zod-schemas/rating";
import dayjs from "dayjs";
import { Metadata } from "next";
import {
    calculateRatingsAverage,
    estimateReadingTime,
    truncateText,
} from "./story-utils";

export async function generateStoryMetadata(
    story: (StoryProps & { ratings: RatingSelectType[] }) | undefined
): Promise<Metadata> {
    if (!story) {
        return {
            title: "Story Not Found | Achebestan",
            description:
                "The requested story could not be found on Achebestan - Discover and share original stories.",
            openGraph: {
                title: "Story Not Found | Achebestan",
                description:
                    "The requested story could not be found on Achebestan - Discover and share original stories.",
                url: `${BASE_URL}`,
                siteName: "Achebestan",
                type: "website",
            },
        };
    }

    // Calculate metrics
    const averageRating = calculateRatingsAverage(story.ratings);
    const totalRatings = story.ratings?.length || 0;
    const readingTime = estimateReadingTime(story.content);

    // Generate dynamic content - prioritize blurb if available, fallback to content
    const storyDescription = story.blurb
        ? truncateText(story.blurb, 155)
        : truncateText(story.content, 155);

    // Create compelling title variations
    const fullTitle = story.subtitle
        ? `${story.title}: ${story.subtitle}`
        : story.title;

    const pageTitle = `${fullTitle} by ${story.author.name}`;

    // Construct URLs
    const baseUrl = `${BASE_URL}`;
    const canonicalUrl = `${baseUrl}/story/${story.isbn}`;
    const imageUrl = story.image || `${baseUrl}/images/iq_detailed.png`;
    const authorUrl = `${baseUrl}/author/${story.authorId}`;

    // Create rich description for social sharing
    const socialDescription = story.blurb
        ? `${truncateText(
              story.blurb,
              140
          )} Read this original story on Achebestan.`
        : `Read ${story.title} by ${story.author.name}. ${truncateText(
              story.content,
              120
          )} - on Achebestan.`;

    // Generate keywords based on content
    const dynamicKeywords = [
        story.title.toLowerCase(),
        story.author.name.toLowerCase(),
        "original story",
        "literature",
        "fiction",
        "reading",
        "books",
        "stories",
        "achebestan",
        story.isbn,
        story.subtitle && story.subtitle.toLowerCase(),
        story.blurb && story.blurb.toLowerCase(),
    ];

    return {
        // Core metadata
        title: pageTitle,
        description: storyDescription,

        // Enhanced meta tags
        keywords: dynamicKeywords.join(", "),
        authors: [
            {
                name: story.author.name,
                url: authorUrl,
            },
        ],
        creator: story.author.name,
        publisher: "Achebestan",
        category: "Literature",

        // Canonical and alternate URLs
        alternates: {
            canonical: canonicalUrl,
        },

        // Comprehensive robots configuration
        robots: {
            index: true,
            follow: true,
            nocache: false,
            googleBot: {
                index: true,
                follow: true,
                noimageindex: false,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },

        // Open Graph metadata (Facebook, LinkedIn, WhatsApp, etc.)
        openGraph: {
            type: "article",
            title: fullTitle,
            description: socialDescription,
            url: canonicalUrl,
            siteName: "Achebestan",
            locale: "en_US",

            // High-quality images for social sharing
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${fullTitle} by ${story.author.name} - Original story on Achebestan`,
                    type: "image/jpeg",
                },
                // Square image for some platforms
                {
                    url: imageUrl,
                    width: 400,
                    height: 400,
                    alt: `${fullTitle} by ${story.author.name}`,
                    type: "image/jpeg",
                },
            ],

            // Article-specific metadata
            publishedTime: dayjs(story.created).toISOString(),
            modifiedTime: story.edited
                ? dayjs(story.edited).toISOString()
                : dayjs(story.created).toISOString(),
            authors: [story.author.name],
            section: "Original Stories",
            tags: [
                story.title,
                story.author.name,
                story.blurb ? story.blurb.toLowerCase() : "",
                "original story",
                "literature",
                "fiction",
                "achebestan",
            ],
        },

        // Twitter Card metadata
        twitter: {
            card: "summary_large_image",
            site: "@achebestan",
            creator: "@achebestan",
            title: `${fullTitle} by ${story.author.name}`,
            description: socialDescription,
            images: [
                {
                    url: imageUrl,
                    alt: `${fullTitle} by ${story.author.name} - Read on Achebestan`,
                },
            ],
        },

        // Additional meta tags for enhanced SEO
        other: {
            // Article metadata
            "article:author": story.author.name,
            "article:published_time": dayjs(story.created).toISOString(),
            "article:modified_time": story.edited
                ? dayjs(story.edited).toISOString()
                : dayjs(story.created).toISOString(),
            "article:section": "Original Stories",
            "article:tag": "original story, literature, fiction",

            // Book-specific metadata
            "book:isbn": story.isbn,
            "book:author": story.author.name,
            "book:tag": `${story.title}, ${story.author.name}, original story`,

            // Rating and interaction metadata
            ...(averageRating > 0 && {
                "rating:average": averageRating.toString(),
                "rating:count": totalRatings.toString(),
                "rating:scale": "5",
            }),

            // Reading metadata
            "reading:time": `${readingTime} min read`,
            "content:type": "original-story",

            // Platform branding
            "theme-color": "#2563eb", // Achebestan brand blue
            "msapplication-TileColor": "#2563eb",
            "application-name": "Achebestan",

            // Mobile optimization
            "mobile-web-app-capable": "yes",
            "apple-mobile-web-app-capable": "yes",
            "apple-mobile-web-app-status-bar-style": "default",
            "apple-mobile-web-app-title": "Achebestan",

            // Additional discovery metadata
            referrer: "origin-when-cross-origin",
            "format-detection": "telephone=no",
        },
    };
}
