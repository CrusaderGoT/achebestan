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
import { NavigationProgress } from "@mantine/nprogress";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

const APP_NAME = "Achebestan";
const APP_DEFAULT_TITLE = "Imagination Suppliments Reality";
const APP_TITLE_TEMPLATE = "%s - Achebestan";
const APP_DESCRIPTION = "A World Of Stories...";

export const metadata: Metadata = {
    applicationName: APP_NAME,
    title: {
        default: APP_DEFAULT_TITLE,
        template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: APP_DEFAULT_TITLE,
        // startUpImage: [],
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        type: "website",
        siteName: APP_NAME,
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
    twitter: {
        card: "summary",
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    ],
    colorScheme: "dark",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html {...mantineHtmlProps} lang="en" dir="ltr">
            <head>
                <ColorSchemeScript />

                <meta name="apple-mobile-web-app-title" content="Achebestan" />

                {/* Preload critical resources */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="dns-prefetch" href="https://achebestan.vercel.app" />

                {/* PWA manifest */}
                <link rel="manifest" href="/manifest.json" />

                {/* Favicon and icons with dark theme */}
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/apple-icon.png" />
            </head>
            <body>
                <MantineProvider>
                    {/** wrap in suspense to prevent build error (because useSearchParams is used in it) */}
                    <Suspense fallback={<NavigationProgress />}>
                        <RouteNavigationProgress />
                    </Suspense>

                    <Notifications limit={1} />

                    <Shell>{children}</Shell>
                </MantineProvider>
            </body>
        </html>
    );
}
