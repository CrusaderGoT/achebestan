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
    };
}
