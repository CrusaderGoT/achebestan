import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
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
};

export default nextConfig;
