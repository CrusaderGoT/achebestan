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
