import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Achebestan",
        short_name: "achebestan",
        description: "A Place To Write Intriguing Stories.",
        theme_color: "gold",
        background_color: "black",
        display: "standalone",
        start_url: "/",
        icons: [
            {
                src: "/public/web-app-manifest-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/public/web-app-manifest-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
