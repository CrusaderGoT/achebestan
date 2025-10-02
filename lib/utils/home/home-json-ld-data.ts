import { BASE_URL } from "@/lib/constants";
import { StoryBookProps } from "@/types/story";
import { Graph } from "schema-dts";

export function homeJsonLdData(stories: StoryBookProps[] | undefined): Graph {
    const baseUrl = `${BASE_URL}`;

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
