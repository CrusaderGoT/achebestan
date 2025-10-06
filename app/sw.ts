import { StorySelectType } from "@/types/story";
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { BackgroundSyncQueue, NetworkFirst, Serwist } from "serwist";

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
        ...defaultCache,
    ],
    disableDevLogs: true,
    fallbacks: {
        entries: [
            {
                url: "/~offline",
                matcher({ request }) {
                    return request.destination === "document";
                },
            },
        ],
    },
});

let urlsToPrecache = ["/", "/story/new"];

self.addEventListener("install", async (event) => {
    const storiesISBNs: string[] = [];

    const stories = await (await fetch("/api/stories")).json();

    if (stories) {
        const parsedStories = stories as StorySelectType[];

        parsedStories.forEach((story) => {
            const url = `/story/${story.isbn}`;
            storiesISBNs.push(url);
        });
        // update the urlsToPrecache
        urlsToPrecache = [...storiesISBNs, ...urlsToPrecache];
    }

    const requestPromises = Promise.all(
        urlsToPrecache.map((entry) => {
            return serwist.handleRequest({
                request: new Request(entry),
                event,
            });
        })
    );

    event.waitUntil(requestPromises);
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
