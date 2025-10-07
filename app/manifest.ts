import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Achebestan",
        short_name: "achebestan",
        description: "A Place To Read Intriguing Stories.",
        theme_color: "black",
        background_color: "#EFBF04",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        icons: [
            {
                src: "/web-app-manifest-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/web-app-manifest-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
        shortcuts: [
            {
                name: "Create New Story",
                short_name: "new story +",
                description: "write a new story and publish it",
                url: "/story/new",
                icons: [
                    {
                        src: "/web-app-manifest-96x96.png",
                        sizes: "96x96",
                        type: "image/png",
                    },
                ],
            },
            {
                name: "Books",
                short_name: "books",
                description: "See Books by your favourite authors",
                url: "/books",
                icons: [
                    {
                        src: "/web-app-manifest-96x96.png",
                        sizes: "96x96",
                        type: "image/png",
                    },
                ],
            },
            {
                name: "Favourites",
                short_name: "favourites",
                description:
                    "View your favourite stories and books, all in one place",
                url: "/favourites",
                icons: [
                    {
                        src: "/web-app-manifest-96x96.png",
                        sizes: "96x96",
                        type: "image/png",
                    },
                ],
            },
            {
                name: "Home Page",
                short_name: "home",
                description: "Open to see top stories",
                url: "/",
                icons: [
                    {
                        src: "/web-app-manifest-96x96.png",
                        sizes: "96x96",
                        type: "image/png",
                    },
                ],
            },
        ],
    };
}
