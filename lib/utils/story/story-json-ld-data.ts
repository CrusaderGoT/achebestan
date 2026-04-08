import { BASE_URL } from "@/lib/constants";
import { CommentTreeProps } from "@/types/comment";
import { StoryProps } from "@/types/story";
import { RatingSelectType } from "@/zod-schemas/rating";
import dayjs from "dayjs";
import { Graph } from "schema-dts";
import { calculateRatingsAverage, estimateReadingTime, highestRating, lowestRating, truncateText } from "./story-utils";

export function storyJsonLdData(
    story: StoryProps & {
        ratings: RatingSelectType[];
    },
    comments: CommentTreeProps[] | undefined
) {
    // Calculate metrics for structured data
    const averageRating = calculateRatingsAverage(story.ratings);
    const totalRatings = story.ratings?.length || 0;
    const readingTime = estimateReadingTime(story.content);
    const baseUrl = `${BASE_URL}`;
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
                "@id": `${baseUrl}/story/${story.isbn}#article`,
                mainEntityOfPage: {
                    "@type": "WebPage",
                    "@id": `${baseUrl}/story/${story.isbn}`,
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
                url: `${baseUrl}/story/${story.isbn}`,
                identifier: {
                    "@type": "PropertyValue",
                    propertyID: "ISBN",
                    value: story.isbn,
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
                "@id": `${baseUrl}/books/${story.isbn}#book`,
                name: story.title,
                alternateName: story.subtitle || undefined,
                author: {
                    "@type": "Person",
                    name: story.author.name,
                    "@id": `${baseUrl}/author/${story.authorId}#person`,
                },
                isbn: story.isbn,
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
                url: `${baseUrl}/story/${story.isbn}`,
                sameAs: `${baseUrl}/story/${story.isbn}`,
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
                    urlTemplate: `${baseUrl}/story/${story.isbn}`,
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

    return structuredData;
}
