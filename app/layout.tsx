// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";

import {
    ColorSchemeScript,
    MantineProvider,
    mantineHtmlProps,
} from "@mantine/core";

import { Notifications } from "@mantine/notifications";

import { Shell } from "@/components/ui/shell";
import { readLatestStories } from "@/lib/actions/story";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Achebestan",
    description: "A hub for my stories...",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html {...mantineHtmlProps} lang="en">
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <MantineProvider>
                    <Notifications />
                    <Shell>{children}</Shell>
                </MantineProvider>
            </body>
        </html>
    );
}

export async function generateStaticParams() {
    const stories = await readLatestStories(10);
    // params to prefetch story across child route, when needed
    return stories?.map((story) => ({
        isbn: story.isbn,
    }));
}

export const revalidate = 3600 * 24;
