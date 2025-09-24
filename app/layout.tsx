// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.layer.css";

import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/tiptap/styles.css";

import "@/styles/global.css";

import {
    ColorSchemeScript,
    MantineProvider,
    mantineHtmlProps,
} from "@mantine/core";

import { Notifications } from "@mantine/notifications";

import { Shell } from "@/components/shell/shell";
import { RouteNavigationProgress } from "@/components/ui/route-navigation-progress";
import type { Metadata } from "next";
import { Suspense } from "react";
import { NavigationProgress } from "@mantine/nprogress";

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
                <meta name="apple-mobile-web-app-title" content="Achebestan" />
            </head>
            <body>
                <MantineProvider>
                    {/** wrap in suspense to prevent build error (because useSearchParams is used in it) */}
                    <Suspense fallback={<NavigationProgress />}>
                        <RouteNavigationProgress />
                    </Suspense>

                    <Notifications />
                    <Shell>{children}</Shell>
                </MantineProvider>
            </body>
        </html>
    );
}
