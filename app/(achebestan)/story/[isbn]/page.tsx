import { CommentTree } from "@/components/comment/comment-tree";
import { StoryActions } from "@/components/story/story-actions";
import { Story } from "@/components/story/story-page";
import { StoryRating } from "@/components/story/story-rating";
import { readStoryComments } from "@/lib/actions/comment";
import { getUserRating } from "@/lib/actions/rating";
import { readStory } from "@/lib/actions/story";
import { auth } from "@/lib/auth";
import {
    calculateRatingsAverage,
    estimateReadingTime,
    highestRating,
    lowestRating,
    truncateText,
} from "@/lib/utils/helpers";
import { sanitizeHTML } from "@/lib/utils/sanitize-html";
import { Center, Divider, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Graph } from "schema-dts";

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

    if (!story) {
        return {
            title: "Story Not Found | Achebestan",
            description:
                "The requested story could not be found on Achebestan - Discover and share original stories.",
            openGraph: {
                title: "Story Not Found | Achebestan",
                description:
                    "The requested story could not be found on Achebestan - Discover and share original stories.",
                url: "https://achebestan.vercel.app",
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

    const pageTitle = `${fullTitle} by ${story.author.name} | Achebestan`;

    // Construct URLs
    const baseUrl = "https://achebestan.vercel.app";
    const canonicalUrl = `${baseUrl}/story/${isbn}`;
    const imageUrl = story.image || `${baseUrl}/images/story-placeholder.jpg`;
    const authorUrl = `${baseUrl}/author/${story.authorId}`;

    // Create rich description for social sharing
    const socialDescription = story.blurb
        ? `${truncateText(
              story.blurb,
              140
          )} Read this original story on Achebestan.`
        : `Discover ${story.title} by ${story.author.name}. ${truncateText(
              story.content,
              120
          )} Read on Achebestan.`;

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
        isbn,
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
            publishedTime: dayjs(story.created).fromNow(true),
            modifiedTime: story.edited
                ? dayjs(story.edited).fromNow(true)
                : dayjs(story.created).fromNow(true),
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
            "article:published_time": dayjs(story.created).fromNow(true),
            "article:modified_time": story.edited
                ? dayjs(story.edited).fromNow(true)
                : dayjs(story.created).fromNow(true),
            "article:section": "Original Stories",
            "article:tag": "original story, literature, fiction",

            // Book-specific metadata
            "book:isbn": isbn,
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

    // Calculate metrics for structured data
    const averageRating = calculateRatingsAverage(story.ratings);
    const totalRatings = story.ratings?.length || 0;
    const readingTime = estimateReadingTime(story.content);
    const baseUrl = "https://achebestan.vercel.app";
    const wordCount = story.content.split(/\s+/).length;
    const highestRate = highestRating(story.ratings);
    const lowestRate = lowestRating(story.ratings);

    // Comprehensive JSON-LD structured data for rich snippets
    const structuredData: Graph = {
        "@context": "https://schema.org",
        "@graph": [
            // Main Creative Work/Article schema
            {
                "@type": "Article",
                "@id": `${baseUrl}/story/${isbn}#article`,
                mainEntityOfPage: {
                    "@type": "WebPage",
                    "@id": `${baseUrl}/story/${isbn}`,
                },
                headline: story.title,
                alternativeHeadline: story.subtitle || undefined,
                description: story.blurb || truncateText(story.content, 300),
                text: story.content,
                wordCount: wordCount,
                timeRequired: `PT${readingTime}M`,
                image: story.image
                    ? {
                          "@type": "ImageObject",
                          url: story.image,
                          width: "1200",
                          height: "630",
                      }
                    : undefined,
                author: {
                    "@type": "Person",
                    name: story.author.name,
                    "@id": `${baseUrl}/author/${story.author.name}#person`,
                    url: `${baseUrl}/author/${story.author.name}`,
                },
                publisher: {
                    "@type": "Organization",
                    name: "Achebestan",
                    "@id": `${baseUrl}#organization`,
                    url: baseUrl,
                    logo: {
                        "@type": "ImageObject",
                        url: `${baseUrl}/web-app-manifest-512x512.png`,
                    },
                },
                datePublished: dayjs(story.created).format(),
                dateModified: story.edited
                    ? dayjs(story.edited).format()
                    : dayjs(story.created).format(),
                inLanguage: "en-US",
                genre: ["Fiction", "Literature", "Original Story"],
                keywords: `${story.title}, ${story.author.name}, original story, literature, fiction, achebestan`,
                url: `${baseUrl}/story/${isbn}`,
                identifier: {
                    "@type": "PropertyValue",
                    propertyID: "ISBN",
                    value: isbn,
                },
                isPartOf: {
                    "@type": "WebSite",
                    name: "Achebestan",
                    "@id": `${baseUrl}#website`,
                },
                ...(totalRatings > 0 && {
                    aggregateRating: {
                        "@type": "AggregateRating",
                        ratingValue: averageRating,
                        reviewCount: totalRatings,
                        bestRating: 5,
                        worstRating: 1,
                        ratingCount: totalRatings,
                    },
                }),
                interactionStatistic: [
                    {
                        "@type": "InteractionCounter",
                        interactionType: {
                            "@type": "CommentAction",
                        },
                        userInteractionCount: comments?.length || 0,
                    },
                    {
                        "@type": "InteractionCounter",
                        interactionType: {
                            "@type": "ReviewAction",
                        },
                        userInteractionCount: totalRatings,
                    },
                ],
            },

            // Book schema for enhanced book discovery
            {
                "@type": "Book",
                "@id": `${baseUrl}/book/${isbn}#book`,
                name: story.title,
                alternateName: story.subtitle || undefined,
                author: {
                    "@type": "Person",
                    name: story.author.name,
                    "@id": `${baseUrl}/author/${story.authorId}#person`,
                },
                isbn: isbn,
                description: story.blurb || truncateText(story.content, 300),
                genre: ["Fiction", "Literature"],
                inLanguage: "en-US",
                numberOfPages: Math.ceil(wordCount / 250), // Estimate pages
                bookFormat: "EBook",
                publisher: {
                    "@type": "Organization",
                    name: "Achebestan",
                    "@id": `${baseUrl}#organization`,
                },
                datePublished: dayjs(story.created).format(),
                url: `${baseUrl}/story/${isbn}`,
                sameAs: `${baseUrl}/story/${isbn}`,
                ...(story.image && {
                    image: story.image,
                }),
                ...(totalRatings > 0 && {
                    aggregateRating: {
                        "@type": "AggregateRating",
                        ratingValue: averageRating,
                        reviewCount: totalRatings,
                        bestRating: highestRate,
                        worstRating: lowestRate,
                    },
                }),
            },

            // Author Person schema
            {
                "@type": "Person",
                "@id": `${baseUrl}/author/${story.authorId}#person`,
                name: story.author.name,
                url: `${baseUrl}/author/${story.authorId}`,
                jobTitle: "Author",
                worksFor: {
                    "@type": "Organization",
                    name: "Achebestan",
                    "@id": `${baseUrl}#organization`,
                },
                mainEntityOfPage: `${baseUrl}/author/${story.authorId}`,
            },

            // Organization schema (Achebestan)
            {
                "@type": "Organization",
                "@id": `${baseUrl}#organization`,
                name: "Achebestan",
                alternateName: "Achebestan Stories",
                url: baseUrl,
                logo: {
                    "@type": "ImageObject",
                    url: `${baseUrl}/web-app-manifest-512x512.png`,
                    width: "200",
                    height: "200",
                },
                description:
                    "Discover and share original stories. A platform for readers and writers to explore literature and fiction.",
                foundingDate: "2025",
                areaServed: "Worldwide",
                knowsAbout: [
                    "Literature",
                    "Fiction",
                    "Original Stories",
                    "Reading",
                    "Writing",
                ],
                sameAs: [
                    "https://twitter.com/achebestan",
                    // Add other social media profiles when available
                ],
            },

            // WebSite schema with search functionality
            {
                "@type": "WebSite",
                "@id": `${baseUrl}#website`,
                url: baseUrl,
                name: "Achebestan",
                description:
                    "Discover and share original stories - A platform for literature enthusiasts",
                publisher: {
                    "@type": "Organization",
                    "@id": `${baseUrl}#organization`,
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
            },

            // Reading Action for enhanced discovery
            {
                "@type": "ReadAction",
                target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${baseUrl}/story/${isbn}`,
                    actionPlatform: [
                        "https://schema.org/DesktopWebPlatform",
                        "https://schema.org/MobileWebPlatform",
                    ],
                },
                expectsAcceptanceOf: {
                    "@type": "Offer",
                    category: "Free",
                    availability: "https://schema.org/InStock",
                },
            },
        ],
    };

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

            {/* Additional meta tags for better crawling */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="dns-prefetch" href="https://achebestan.vercel.app" />

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
