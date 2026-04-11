import { BASE_URL } from "@/lib/constants";
import { StoryAuthorProps } from "@/types/story";
import { Metadata } from "next";

export function generateHomeMetadata(
    stories: StoryAuthorProps[] | undefined,
): Metadata {
    const dynamicDescription = generateDynamicDescription(stories);
    const storyThemes = extractStoryThemes(stories);

    // Create compelling social sharing description
    const socialDescription =
        stories && stories.length > 0
            ? `Enter Achebestan's Mind Palace - where dark fiction meets adventure. Nigerian author Achebestan shares ${
                  stories.length
              } ${
                  stories.length === 1 ? "story" : "stories"
              } from his imagination. Consume responsibly...`
            : `Welcome to Achebestan's Mind Palace - A world of intriguing, dark poetry and adventure stories by Nigerian author Achebestan. Consume responsibly...`;

    // Generate comprehensive keywords
    const comprehensiveKeywords = [
        "achebestan",
        "nigerian author",
        "dark fiction",
        "poetry",
        "adventure stories",
        "world building",
        "african storytelling",
        "mind palace",
        "imagination",
        "young adult fiction",
        "dark tales",
        "creative writing",
        "fictional stories",
        "intriguing stories",
        ...storyThemes,
    ];

    // Create age-appropriate title variations
    const mainTitle = "Imagination Suppliments Reality";
    return {
        // Core metadata
        title: mainTitle,
        description: dynamicDescription,

        // Enhanced meta tags
        keywords: comprehensiveKeywords.join(", "),
        authors: [{ name: "Achebestan", url: BASE_URL }],
        creator: "Achebestan",
        publisher: "Achebestan",
        category: "Literature",

        // Canonical URL
        alternates: {
            canonical: BASE_URL,
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

        // Open Graph metadata (Facebook, Instagram, WhatsApp, etc.)
        openGraph: {
            type: "website",
            title: "Achebestan's Mind Palace - Dark Fiction & Adventure",
            description: socialDescription,
            url: BASE_URL,
            siteName: "Achebestan's Mind Palace",
            locale: "en_US",

            // High-quality images for social sharing
            images: [
                {
                    url: `${BASE_URL}/web-app-manifest-512x512.png`,
                    width: 512,
                    height: 512,
                    alt: "Achebestan's Mind Palace - Dark Fiction and Adventure Stories",
                    type: "image/jpeg",
                },
                // Author image for personal branding
                {
                    url: `${BASE_URL}/images/iq_detailed.png`,
                    width: 998,
                    height: 998,
                    alt: "Achebestan - Nigerian Author",
                    type: "image/jpeg",
                },
            ],
        },

        // Twitter Card metadata
        twitter: {
            card: "summary_large_image",
            site: "@achebestan", // Add when Twitter account is created
            creator: "@achebestan",
            title: "Achebestan's Mind Palace - Dark Fiction & Adventure",
            description: socialDescription,
            images: [
                {
                    url: `${BASE_URL}/web-app-manifest-512x512.png`,
                    alt: "Enter Achebestan's Mind Palace - Dark Fiction and Adventure Stories",
                },
            ],
        },

        // Additional meta tags for enhanced SEO
        other: {
            // Personal brand metadata
            author: "Achebestan",
            "pen-name": "Achebestan",
            nationality: "Nigerian",
            "content:creator": "Achebestan",

            // Platform metadata
            "application-name": "Achebestan's Mind Palace",
            "apple-mobile-web-app-title": "Achebestan",
            "msapplication-TileColor": "#1a1a1a", // Dark theme
            "theme-color": "#1a1a1a",

            // Content metadata
            "content:type": "personal-blog",
            "content:category": "dark-fiction,poetry,adventure",
            "platform:type": "personal-writing-platform",
            genre: "dark fiction, poetry, adventure stories",

            // Target audience metadata
            audience: "young adult",
            "age-rating": "13+",
            "content-rating": "teen",

            // Geographic and cultural metadata
            "geo.region": "NG", // Nigeria
            "geo.country": "Nigeria",
            "cultural-context": "african-storytelling",
            "literary-tradition": "nigerian-literature",

            // Mobile optimization
            "mobile-web-app-capable": "yes",
            "apple-mobile-web-app-capable": "yes",
            "apple-mobile-web-app-status-bar-style": "black-translucent",

            // Language and locale
            "content-language": "en-US",
            "original-language": "en",

            // Additional discovery metadata
            referrer: "origin-when-cross-origin",
            "format-detection": "telephone=no",
            "revisit-after": "3 days",

            // Literary metadata
            "literary-genre": "dark fiction, adventure, poetry",
            "writing-style": "imaginative, dark, world-building",
            "narrative-voice": "first-person, immersive",

            // Social media additional tags
            "fb:app_id": "YOUR_FACEBOOK_APP_ID", // Add when available

            // Additional Open Graph tags
            "og:site_name": "Achebestan's Mind Palace",
            "og:locale": "en_US",
            "og:type": "website",
            "og:image:alt":
                "Achebestan - Nigerian Author of Dark Fiction and Adventure Stories",

            // Pinterest (good for story/book discovery)
            "pinterest-rich-pin": "true",
            "pinterest:description":
                "Dark fiction and adventure stories from Nigerian author Achebestan",

            // Reading and engagement hints
            "reading-time":
                stories && stories.length > 0
                    ? `${stories.length} stories available`
                    : "Stories coming soon",
            "update-frequency": "when new stories are published",

            // Brand tagline
            tagline: "A place for intriguing, dark, poetry, stories",
            motto: "Consume Responsibly...",
        },

        // Verification tags (add when accounts are created)
        verification: {
            // google: 'your-google-site-verification',
            // yandex: 'your-yandex-verification',
            other: {
                me: ["https://twitter.com/achebestan"],
            },
        },
    };
}

// Helper function to generate dynamic description based on latest stories
export function generateDynamicDescription(
    stories: StoryAuthorProps[] | undefined,
): string {
    const baseDescription =
        "Welcome to Achebestan's Mind Palace - A world of intriguing, dark poetry and stories. Explore adventure tales and world-building from the imagination of Nigerian author Achebestan.";

    if (!stories || stories.length === 0) {
        return `${baseDescription} Dive into fictional stories, concoctions of imagination, and sensations of life.`;
    }

    const latestCount = stories.length;
    const recentTitle = stories[0]?.title;

    return `${baseDescription} ${
        latestCount > 1
            ? `Discover ${latestCount} latest stories including "${recentTitle}" and more.`
            : `Read the latest story "${recentTitle}".`
    } Consume responsibly...`;
}

// Helper function to extract story themes for keywords
export function extractStoryThemes(
    stories: StoryAuthorProps[] | undefined,
): string[] {
    const baseThemes = [
        "dark fiction",
        "poetry",
        "adventure stories",
        "world building",
        "nigerian author",
        "african storytelling",
        "imagination",
        "dark tales",
    ];

    if (!stories || stories.length === 0) return baseThemes;

    // Add story titles as keywords (first 3 stories)
    const storyKeywords = stories.slice(0, 3).map((story) =>
        story.title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .trim(),
    );

    return [...baseThemes, ...storyKeywords];
}
