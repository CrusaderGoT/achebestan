import { HomePage } from "@/components/home/homepage";
import { readLatestStories } from "@/lib/actions/story";
import { StoryBookProps } from "@/lib/types/story";
import { sanitizeHTML } from "@/lib/utils/sanitize-html";
import type { Metadata } from "next";
import { Graph } from "schema-dts";

// Helper function to generate dynamic description based on latest stories
function generateDynamicDescription(
    stories: StoryBookProps[] | undefined
): string {
    const baseDescription =
        "Welcome to Achebestan's Mind Palace - A world of intriguing, dark poetry and stories. Explore adventure tales and world-building from the imagination of Nigerian author Enemchukwu Chukwuemeka.";

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
function extractStoryThemes(stories: StoryBookProps[] | undefined): string[] {
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
            .trim()
    );

    return [...baseThemes, ...storyKeywords];
}

// Generate structured data for homepage
function generateHomepageStructuredData(
    stories: StoryBookProps[] | undefined
): Graph {
    const baseUrl = "https://achebestan.vercel.app";

    return {
        "@context": "https://schema.org",
        "@graph": [
            // Personal WebSite schema
            {
                "@type": "WebSite",
                "@id": `${baseUrl}#website`,
                url: baseUrl,
                name: "Achebestan - Mind's Palace",
                alternateName: "Achebestan Stories",
                description:
                    "Personal writing platform of Nigerian author Enemchukwu Chukwuemeka (Achebestan). A world of intriguing, dark poetry and adventure stories.",
                author: {
                    "@type": "Person",
                    "@id": `${baseUrl}#author`,
                },
                publisher: {
                    "@type": "Person",
                    "@id": `${baseUrl}#author`,
                },
                potentialAction: {
                    "@type": "SearchAction",
                    target: {
                        "@type": "EntryPoint",
                        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
                    },
                    query: "required name=search_term_string",
                },
                inLanguage: "en-US",
                copyrightYear: new Date().getFullYear(),
                copyrightHolder: {
                    "@type": "Person",
                    "@id": `${baseUrl}#author`,
                },
                genre: [
                    "Dark Fiction",
                    "Poetry",
                    "Adventure",
                    "World Building",
                ],
                audience: {
                    "@type": "Audience",
                    audienceType: "Young Adult Readers",
                },
                keywords:
                    "dark fiction, poetry, adventure stories, nigerian author, african storytelling, world building",
            },

            // Author Person schema (Enemchukwu Chukwuemeka / Achebestan)
            {
                "@type": "Person",
                "@id": `${baseUrl}#author`,
                name: "Enemchukwu Chukwuemeka",
                alternateName: "Achebestan",
                givenName: "Enemchukwu",
                familyName: "Chukwuemeka",
                url: baseUrl,
                image: `${baseUrl}/images/demo.jpg`,
                description:
                    "Nigerian author and storyteller, creator of dark fiction, poetry, and adventure tales. Known for intricate world-building and imaginative narratives.",
                jobTitle: "Author",
                hasOccupation: {
                    "@type": "Occupation",
                    name: "Author",
                    occupationLocation: {
                        "@type": "Country",
                        name: "Nigeria",
                    },
                    description:
                        "Creative writer specializing in dark fiction, poetry, and adventure stories",
                },
                nationality: {
                    "@type": "Country",
                    name: "Nigeria",
                },
                birthPlace: {
                    "@type": "Country",
                    name: "Nigeria",
                },
                knowsAbout: [
                    "Creative Writing",
                    "Dark Fiction",
                    "Poetry",
                    "World Building",
                    "Adventure Stories",
                    "African Literature",
                ],
                alumniOf: {
                    "@type": "EducationalOrganization",
                    name: "Nigerian Educational Institution",
                },
                owns: {
                    "@type": "ProductCollection",
                    "@id": `${baseUrl}#website`,
                },
                mainEntityOfPage: baseUrl,
                sameAs: [
                    // Add social media profiles when available
                ],
            },

            // Blog/Personal Website
            {
                "@type": "Blog",
                "@id": `${baseUrl}#blog`,
                url: baseUrl,
                name: "Achebestan's Mind Palace",
                description:
                    "Personal blog and story collection featuring dark fiction, poetry, and adventure tales by Nigerian author Enemchukwu Chukwuemeka.",
                author: {
                    "@type": "Person",
                    "@id": `${baseUrl}#author`,
                },
                publisher: {
                    "@type": "Person",
                    "@id": `${baseUrl}#author`,
                },
                inLanguage: "en-US",
                genre: ["Dark Fiction", "Poetry", "Adventure Stories"],
                audience: {
                    "@type": "Audience",
                    audienceType: "Young Adult Readers",
                },
            },

            // Collection of latest stories (if available)
            {
                "@type": "ItemList",
                "@id": `${baseUrl}#latest-stories`,
                name: "Latest Stories by Achebestan",
                description: `Recent fictional stories and tales from Enemchukwu Chukwuemeka's imagination`,
                numberOfItems: stories?.length,
                itemListElement: stories?.slice(0, 6).map((story, index) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    item: {
                        "@type": ["CreativeWork", "Article"],
                        "@id": `${baseUrl}/story/${story.isbn}#article`,
                        name: story.title,
                        alternateName: story.subtitle || undefined,
                        description:
                            story.blurb ||
                            story.content.substring(0, 200) + "...",
                        author: {
                            "@type": "Person",
                            "@id": `${baseUrl}#author`,
                            name: "Enemchukwu Chukwuemeka",
                            alternateName: "Achebestan",
                        },
                        datePublished: story.created,
                        dateModified: story.edited || story.created,
                        url: `${baseUrl}/story/${story.isbn}`,
                        image: story.image || undefined,
                        genre: [
                            "Dark Fiction",
                            "Adventure",
                            "Creative Writing",
                        ],
                        inLanguage: "en-US",
                        isPartOf: {
                            "@type": "Blog",
                            "@id": `${baseUrl}#blog`,
                        },
                        keywords: `${story.title}, achebestan, dark fiction, nigerian author`,
                    },
                })),
            },

            // Creative Work Collection (Author's Portfolio)
            {
                "@type": "CreativeWorkSeries",
                "@id": `${baseUrl}#creative-works`,
                name: "Achebestan's Literary Works",
                description:
                    "A collection of dark fiction, poetry, and adventure stories from the mind of Nigerian author Enemchukwu Chukwuemeka.",
                author: {
                    "@type": "Person",
                    "@id": `${baseUrl}#author`,
                },
                genre: [
                    "Dark Fiction",
                    "Poetry",
                    "Adventure Stories",
                    "World Building",
                ],
                inLanguage: "en-US",
            },

            // Breadcrumb navigation
            {
                "@type": "BreadcrumbList",
                "@id": `${baseUrl}#breadcrumb`,
                itemListElement: [
                    {
                        "@type": "ListItem",
                        position: 1,
                        name: "Achebestan's Mind Palace",
                        item: baseUrl,
                    },
                ],
            },
        ],
    };
}

// Generate metadata for homepage
export async function generateMetadata(): Promise<Metadata> {
    // Fetch latest stories for dynamic content
    const stories = await readLatestStories(10);

    const baseUrl = "https://achebestan.vercel.app";
    const dynamicDescription = generateDynamicDescription(stories);
    const storyThemes = extractStoryThemes(stories);

    // Create compelling social sharing description
    const socialDescription =
        stories && stories.length > 0
            ? `Enter Achebestan's Mind Palace - where dark fiction meets adventure. Nigerian author Enemchukwu Chukwuemeka shares ${
                  stories.length
              } ${
                  stories.length === 1 ? "story" : "stories"
              } from his imagination. Consume responsibly...`
            : `Welcome to Achebestan's Mind Palace - A world of intriguing, dark poetry and adventure stories by Nigerian author Enemchukwu Chukwuemeka. Consume responsibly...`;

    // Generate comprehensive keywords
    const comprehensiveKeywords = [
        "achebestan",
        "enemchukwu chukwuemeka",
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
    const mainTitle =
        stories && stories.length > 0
            ? `Achebestan's Mind Palace - Dark Fiction & Adventure Stories by Nigerian Author`
            : `Achebestan - Dark Fiction, Poetry & Adventure Stories by Enemchukwu Chukwuemeka`;

    return {
        // Core metadata
        title: mainTitle,
        description: dynamicDescription,

        // Enhanced meta tags
        keywords: comprehensiveKeywords.join(", "),
        authors: [{ name: "Enemchukwu Chukwuemeka", url: baseUrl }],
        creator: "Enemchukwu Chukwuemeka (Achebestan)",
        publisher: "Achebestan",
        category: "Literature",

        // Canonical URL
        alternates: {
            canonical: baseUrl,
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
            url: baseUrl,
            siteName: "Achebestan's Mind Palace",
            locale: "en_US",

            // High-quality images for social sharing
            images: [
                {
                    url: `${baseUrl}/images/achebestan-og-home.jpg`,
                    width: 1200,
                    height: 630,
                    alt: "Achebestan's Mind Palace - Dark Fiction and Adventure Stories by Nigerian Author Enemchukwu Chukwuemeka",
                    type: "image/jpeg",
                },
                // Author image for personal branding
                {
                    url: `${baseUrl}/images/demo.jpg`,
                    width: 998,
                    height: 998,
                    alt: "Enemchukwu Chukwuemeka (Achebestan) - Nigerian Author",
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
                    url: `${baseUrl}/images/achebestan-og-home.jpg`,
                    alt: "Enter Achebestan's Mind Palace - Dark Fiction and Adventure Stories",
                },
            ],
        },

        // Additional meta tags for enhanced SEO
        other: {
            // Personal brand metadata
            author: "Enemchukwu Chukwuemeka",
            "pen-name": "Achebestan",
            nationality: "Nigerian",
            "content:creator": "Enemchukwu Chukwuemeka",

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
                "Dark fiction and adventure stories from Nigerian author Enemchukwu Chukwuemeka",

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

export default async function Home() {
    const stories = await readLatestStories(10);

    // Generate structured data
    const structuredData = generateHomepageStructuredData(stories);

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

            {/* Preload critical resources */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="dns-prefetch" href="https://achebestan.vercel.app" />

            {/* Preload hero image for better performance */}
            <link rel="preload" href="/images/demo.jpg" as="image" />

            {/* PWA manifest */}
            <link rel="manifest" href="/manifest.json" />

            {/* Favicon and icons with dark theme */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/apple-icon.png" />

            {/* Additional meta for personal brand */}
            <meta name="author" content="Enemchukwu Chukwuemeka" />
            <meta
                name="copyright"
                content={`© ${new Date().getFullYear()} Enemchukwu Chukwuemeka (Achebestan)`}
            />

            <HomePage stories={stories} />
        </>
    );
}

export const revalidate = 86400; // 24 hours in seconds
