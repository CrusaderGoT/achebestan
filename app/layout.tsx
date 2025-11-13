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
import { CentralizedAuthContextProvider } from "@/lib/auth/centralized-auth-context-provider";
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { SerwistProvider } from "$lib/client";
import { NavigationProgress } from "@mantine/nprogress";

=======
>>>>>>> 4e8afd5 (Revert "upgraded serwist to work with turbo pack. and removed the deprecated new Serwist initialization process.")
import { BASE_URL } from "@/lib/constants";
=======
import { SerwistProvider } from "@/lib/serwist-client";
>>>>>>> e9c9aca (Reapply "upgraded serwist to work with turbo pack. and removed the deprecated new Serwist initialization process.")
import { NavigationProgress } from "@mantine/nprogress";

=======
>>>>>>> 6661f0f (Revert "upgraded serwist to work with turbo pack. and removed the deprecated new Serwist initialization process.")
import { BASE_URL } from "@/lib/constants";
import { NavigationProgress } from "@mantine/nprogress";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

const APP_NAME = "Achebestan";
const APP_DEFAULT_TITLE =
    "Achebestan - Dark Fiction, Poetry & Adventure Stories by Enemchukwu Chukwuemeka";
const APP_TITLE_TEMPLATE = "%s - Achebestan";
const APP_DESCRIPTION = "A World Of Stories...";

export const metadata: Metadata = {
    applicationName: APP_NAME,
    title: {
        default: APP_DEFAULT_TITLE,
        template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    manifest: "/manifest.webmanifest",
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
                <link rel="dns-prefetch" href={`${BASE_URL}`} />

                {/* PWA manifest */}
                <link rel="manifest" href="/manifest.webmanifest" />

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

                    <Notifications limit={5} zIndex={9999} />

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                    <SerwistProvider
                        swUrl="/serwist/sw.js"
=======
                    <SerwistProvider
                        swUrl="/serwist/sw.js"
                        options={{ scope: "/" }}
>>>>>>> e9c9aca (Reapply "upgraded serwist to work with turbo pack. and removed the deprecated new Serwist initialization process.")
                    >
                        <CentralizedAuthContextProvider>
                            <Shell>{children}</Shell>
                        </CentralizedAuthContextProvider>
                    </SerwistProvider>
<<<<<<< HEAD
=======
                    <CentralizedAuthContextProvider>
                        <Shell>{children}</Shell>
                    </CentralizedAuthContextProvider>
>>>>>>> 4e8afd5 (Revert "upgraded serwist to work with turbo pack. and removed the deprecated new Serwist initialization process.")
=======
>>>>>>> e9c9aca (Reapply "upgraded serwist to work with turbo pack. and removed the deprecated new Serwist initialization process.")
=======
                    <CentralizedAuthContextProvider>
                        <Shell>{children}</Shell>
                    </CentralizedAuthContextProvider>
>>>>>>> 6661f0f (Revert "upgraded serwist to work with turbo pack. and removed the deprecated new Serwist initialization process.")
                </MantineProvider>
            </body>
        </html>
    );
}
