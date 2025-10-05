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

// Constants for better maintainability
const CACHE_NAMES = {
    IMAGES: "images-v1",
    API: "api-cache-v1",
    STATIC: "static-resources-v1",
} as const;

const CACHE_EXPIRATION = {
    IMAGES: 30 * 24 * 60 * 60, // 30 days in seconds
    API: 5 * 60, // 5 minutes in seconds
    MAX_ENTRIES: 50,
} as const;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        {
            matcher: ({ url }) => url.pathname.startsWith("/story/"),
            handler: new NetworkFirst({
                cacheName: "story-pages",
                networkTimeoutSeconds: 5,
                plugins: [
                    {
                        cacheWillUpdate: async ({ response }) => {
                            // Only cache successful responses
                            return response?.status === 200 ? response : null;
                        },
                    },
                ],
            }),
        },
        // Cache images with CacheFirst strategy
        {
            matcher: ({ request }) =>
                request.destination === "image" ||
                /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i.test(request.url),
            handler: new CacheFirst({
                cacheName: CACHE_NAMES.IMAGES,
                plugins: [
                    {
                        cacheWillUpdate: async ({ response }) => {
                            // Only cache successful responses
                            return response?.status === 200 ? response : null;
                        },
                    },
                    {
                        // Add expiration plugin
                        cacheDidUpdate: async ({ cacheName }) => {
                            const cache = await caches.open(cacheName);
                            const keys = await cache.keys();

                            // Limit cache entries
                            if (keys.length > CACHE_EXPIRATION.MAX_ENTRIES) {
                                await cache.delete(keys[0]);
                            }
                        },
                    },
                ],
            }),
        },
        // Cache API calls with NetworkFirst - FIXED URL
        {
            matcher: ({ url }) =>
                url.hostname === "api.achebestan.vercel.app" ||
                url.pathname.startsWith("/api/"),
            handler: new NetworkFirst({
                cacheName: CACHE_NAMES.API,
                networkTimeoutSeconds: 10,
                plugins: [
                    {
                        cacheWillUpdate: async ({ response }) => {
                            // Only cache successful responses
                            return response?.status === 200 ? response : null;
                        },
                    },
                ],
            }),
        },
        // Cache static assets with StaleWhileRevalidate
        {
            matcher: ({ request }) =>
                request.destination === "style" ||
                request.destination === "script" ||
                request.destination === "font" ||
                /\.(?:js|css|woff2?)$/i.test(request.url),
            handler: new StaleWhileRevalidate({
                cacheName: CACHE_NAMES.STATIC,
            }),
        },
        // Use default cache for everything else
        ...defaultCache,
    ],
    disableDevLogs: true,
});

// Enhanced push notification handler
self.addEventListener("push", (event: PushEvent) => {
    if (!event.data) {
        console.warn("Push event received without data");
        return;
    }

    try {
        const data = event.data.json();

        // Validate required fields
        if (!data.title) {
            console.error("Push notification missing title");
            return;
        }

        const options: NotificationOptions & {
            vibrate?: number[];
            actions?: [];
            timestamp?: number;
            renotify?: boolean;
        } = {
            body: data.body || "",
            icon: data.icon || "/web-app-manifest-512x512.png",
            badge: data.badge || "/web-app-manifest-192x192.png",
            vibrate: [200, 100, 200],
            tag: data.tag || `notification-${Date.now()}`,
            data: {
                url: data.url || "/",
                ...data.data,
            },
            actions: data.actions || [],
            requireInteraction: data.requireInteraction ?? false,
            timestamp: Date.now(),
            silent: data.silent ?? false,
            renotify: data.renotify ?? false,
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (error) {
        console.error("Error processing push notification:", error);
        // Show a fallback notification
        event.waitUntil(
            self.registration.showNotification("New Notification", {
                body: "You have a new notification",
                icon: "/web-app-manifest-192x192.png",
            })
        );
    }
});

// Enhanced notification click handler
self.addEventListener("notificationclick", (event: NotificationEvent) => {
    event.notification.close();

    // Handle action clicks
    if (event.action) {
        console.log("Notification action clicked:", event.action);
        // Handle specific actions here based on event.action
    }

    const urlToOpen = new URL(
        event.notification.data?.url || "/",
        self.location.origin
    ).href;

    event.waitUntil(
        (async () => {
            try {
                const clientList = await self.clients.matchAll({
                    type: "window",
                    includeUncontrolled: true,
                });

                // Try to find and focus existing window
                for (const client of clientList) {
                    const clientUrl = new URL(client.url).href;
                    if (clientUrl === urlToOpen && "focus" in client) {
                        return await client.focus();
                    }
                }

                // If no matching window, check if we can focus any client and navigate
                if (clientList.length > 0) {
                    const client = clientList[0];
                    if ("focus" in client && "navigate" in client) {
                        await client.focus();
                        return await (client as WindowClient).navigate(
                            urlToOpen
                        );
                    }
                }

                // Otherwise, open a new window
                if (self.clients.openWindow) {
                    return await self.clients.openWindow(urlToOpen);
                }
            } catch (error) {
                console.error("Error handling notification click:", error);
            }
        })()
    );
});

// Handle notification close events for analytics
self.addEventListener("notificationclose", (event: NotificationEvent) => {
    console.log("Notification closed:", event.notification.tag);

    // Optional: Send analytics
    // event.waitUntil(
    //     fetch("/api/analytics/notification-close", {
    //         method: "POST",
    //         body: JSON.stringify({
    //             tag: event.notification.tag,
    //             timestamp: Date.now(),
    //         }),
    //     })
    // );
});

// Background sync queue for offline requests
const queue = new BackgroundSyncQueue("notification-queue", {
    maxRetentionTime: 24 * 60, // Retry for max 24 hours (in minutes)
});

// Enhanced fetch handler for queuing
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

// Bypass service worker entirely for Cloudinary requests
  if (url.hostname.includes('cloudinary.com')) {
    return; // Browser handles it directly, no SW intervention
  }

    // Queue notification API requests when offline
    if (
        url.pathname.includes("/api/notifications") &&
        event.request.method === "POST"
    ) {
        event.respondWith(
            fetch(event.request.clone()).catch(async (error) => {
                console.log("Queuing request for background sync:", error);
                await queue.pushRequest({ request: event.request });

                return new Response(
                    JSON.stringify({
                        queued: true,
                        message: "Request queued for background sync",
                    }),
                    {
                        headers: { "Content-Type": "application/json" },
                        status: 202,
                    }
                );
            })
        );
    }
});

// Clean up old caches on activation
self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            const validCacheNames = new Set<string>(Object.values(CACHE_NAMES));

            await Promise.all(
                cacheNames.map(async (cacheName) => {
                    // Delete old cache versions
                    if (
                        !validCacheNames.has(cacheName) &&
                        (cacheName.startsWith("images-") ||
                            cacheName.startsWith("api-cache-") ||
                            cacheName.startsWith("static-resources-"))
                    ) {
                        console.log("Deleting old cache:", cacheName);
                        await caches.delete(cacheName);
                    }
                })
            );
        })()
    );
});

// Handle sync events for background sync
self.addEventListener("sync", (event) => {
    console.log("Background sync event:", event.tag);

    if (event.tag === "notification-queue") {
        event.waitUntil(queue.replayRequests());
    }
});

// Initialize Serwist
serwist.addEventListeners();
