import type { NextConfig } from "next";

import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
    swSrc: "app/sw.ts",
    swDest: "public/sw.js",
    cacheOnNavigation: true,
    scope: "/",
    register: true,
    reloadOnOnline: true,
    disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
    reactStrictMode: true,
    experimental: {
        optimizePackageImports: [
            "@mantine/core",
            "@mantine/hooks",
            "@mantine/dropzone",
            "@mantine/form",
            "@mantine/notifications",
            "@mantine/tiptap",
            "@tabler/icons-react",
        ],
        serverActions: {
            bodySizeLimit: "70mb",
        },
        authInterrupts: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
        ],
    },
    async headers() {
    return [
        {
            source: "/(.*)",
            headers: [
                {
                    key: "X-Content-Type-Options",
                    value: "nosniff",
                },
                {
                    key: "X-Frame-Options",
                    value: "DENY",
                },
                {
                    key: "Referrer-Policy",
                    value: "strict-origin-when-cross-origin",
                },
                {
                    key: "Content-Security-Policy",
                    value: [
                        "default-src 'self'",
                        "img-src 'self' https://res.cloudinary.com https://*.cloudinary.com data: blob:",
                        "media-src 'self' https://res.cloudinary.com https://*.cloudinary.com blob:",
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widget.cloudinary.com",
                        "style-src 'self' 'unsafe-inline'",
                        "connect-src 'self' https://api.cloudinary.com https://*.cloudinary.com",
                        "frame-src https://widget.cloudinary.com"
                    ].join("; "),
                },
            ],
        },
        {
            source: "/sw.js",
            headers: [
                {
                    key: "Content-Type",
                    value: "application/javascript; charset=utf-8",
                },
                {
                    key: "Cache-Control",
                    value: "no-cache, no-store, must-revalidate",
                },
                {
                    key: "Content-Security-Policy",
                    value: "default-src 'self'; script-src 'self'",
                },
            ],
        },
    ];
},
};

export default withSerwist(nextConfig);
