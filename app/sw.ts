import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
    BackgroundSyncQueue,
    CacheFirst,
    NetworkFirst,
    Serwist,
    StaleWhileRevalidate,
} from "serwist";

// Declare the value of `injectionPoint` to TypeScript
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        {
            matcher: ({ url }) => url.pathname.startsWith("/story/"),
            handler: new NetworkFirst(),
        },
        // Cache images with CacheFirst strategy, off for now
        {
            matcher: /^http:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: new CacheFirst({
                cacheName: "images",
                plugins: [
                    {
                        cacheWillUpdate: async ({ response }) => {
                            return response.status === 200 ? response : null;
                        },
                    },
                ],
            }),
        },
        // Cache API calls with NetworkFirst
        {
            matcher: /^https:\/\/api\/achebestan\.vercel\.app\/.*/,
            handler: new NetworkFirst({
                cacheName: "api-cache",
                networkTimeoutSeconds: 10,
            }),
        },
        // Cache static assets with StaleWhileRevalidate
        {
            matcher: /\.(?:js|css|woff2?)$/,
            handler: new StaleWhileRevalidate({
                cacheName: "static-resources",
            }),
        },
        // Use default cache for everything else
        ...defaultCache,
    ],
    disableDevLogs: true,
});

// Add push notification event listeners
self.addEventListener("push", (event: PushEvent) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options: NotificationOptions = {
            body: data.body,
            icon: data.icon || "/web-app-manifest-512x512.png",
            badge: data.badge || "/web-app-manifest-192x192.png",
            //vibrate: [200, 100, 200],
            tag: data.tag || "notification",
            data: data.data || {},
            //actions: data.actions || [],
            requireInteraction: true,
            //timestamp: Date.now(),
            silent: false,
        };

        event.waitUntil(
            self.registration.showNotification(data.title, {
                ...options,
                ...{
                    vibrate: [200, 100, 200],
                    actions: data.actions || [],
                    timestamp: Date.now(),
                },
            })
        );
    } catch (error) {
        console.error("Error processing push notification:", error);
    }
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || "/";

    event.waitUntil(
        (async () => {
            const clientList = await self.clients.matchAll({
                type: "window",
                includeUncontrolled: true,
            });

            // If a window is already open, focus it
            for (const client of clientList) {
                if (client.url === urlToOpen && "focus" in client) {
                    return client.focus();
                }
            }

            // Otherwise, open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })()
    );
});

// Handle notification close events (optional analytics)
self.addEventListener("notificationclose", (event: NotificationEvent) => {
    console.log("Notification closed:", event.notification.tag);
});

const queue = new BackgroundSyncQueue("notification-queue", {
    maxRetentionTime: 24 * 60, // Retry for max 24 hours (in minutes)
});

// Add requests to queue when offline
self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("/api/notifications")) {
        event.respondWith(
            fetch(event.request.clone()).catch(async () => {
                await queue.pushRequest({ request: event.request });
                return new Response(JSON.stringify({ queued: true }), {
                    headers: { "Content-Type": "application/json" },
                    status: 202,
                });
            })
        );
    }
});

// Initialize Serwist
serwist.addEventListeners();
