import { StorySelectType } from "@/types/story";
import { defaultCache } from "@serwist/next/worker";
import type {
    BackgroundSyncQueueEntry,
    PrecacheEntry,
    SerwistGlobalConfig,
} from "serwist";
import {
    BackgroundSyncQueue,
    CacheableResponsePlugin,
    CacheFirst,
    ExpirationPlugin,
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
    IMAGES: "images-v2",
    API: "api-cache-v2",
    STATIC: "static-resources-v2",
    STORY: "story-page-v2",
    STORIES_LIST: "stories-list-v2",
    RUNTIME: "runtime-v2",
} as const;

const CACHE_VERSION = "v2"; // Increment when you need to force cache refresh

// Initialize Serwist
const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: false, // Disable for better control - can cause issues with Next.js
    runtimeCaching: [
        ...defaultCache,
        // Story pages - StaleWhileRevalidate for fast loading with updates
        {
            matcher: ({ url }) =>
                url.pathname.startsWith("/story/") &&
                !url.pathname.includes("new"),
            handler: new StaleWhileRevalidate({
                cacheName: CACHE_NAMES.STORY,
                plugins: [
                    new CacheableResponsePlugin({
                        statuses: [0, 200],
                    }),
                    new ExpirationPlugin({
                        maxEntries: 50,
                        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                        purgeOnQuotaError: true,
                    }),
                ],
            }),
        },
        // API stories list - NetworkFirst for fresh data, fallback to cache
        {
            matcher: ({ url }) => url.pathname === "/api/stories",
            handler: new NetworkFirst({
                cacheName: CACHE_NAMES.STORIES_LIST,
                plugins: [
                    new CacheableResponsePlugin({
                        statuses: [0, 200],
                    }),
                    new ExpirationPlugin({
                        maxEntries: 1,
                        maxAgeSeconds: 24 * 60 * 60, // 1 day
                    }),
                ],
                networkTimeoutSeconds: 5, // Fallback to cache after 5s
            }),
        },
        // Images - CacheFirst for performance
        {
            matcher: ({ request }) => request.destination === "image",
            handler: new CacheFirst({
                cacheName: CACHE_NAMES.IMAGES,
                plugins: [
                    new CacheableResponsePlugin({
                        statuses: [0, 200],
                    }),
                    new ExpirationPlugin({
                        maxEntries: 100,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                        purgeOnQuotaError: true,
                    }),
                ],
            }),
        },
        // API routes - NetworkFirst with short timeout
        {
            matcher: ({ url }) =>
                url.pathname.startsWith("/api/") &&
                url.pathname !== "/api/stories" &&
                !url.pathname.includes("/api/notifications"),
            handler: new NetworkFirst({
                cacheName: CACHE_NAMES.API,
                plugins: [
                    new CacheableResponsePlugin({
                        statuses: [0, 200],
                    }),
                    new ExpirationPlugin({
                        maxEntries: 50,
                        maxAgeSeconds: 5 * 60, // 5 minutes
                    }),
                ],
                networkTimeoutSeconds: 3,
            }),
        },
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

// Add core pages to precache
serwist.addToPrecacheList([
    { url: "/", revision: CACHE_VERSION },
    { url: "/story/new", revision: CACHE_VERSION },
    { url: "/~offline", revision: CACHE_VERSION },
]);

// Install event - Keep it simple and fast
self.addEventListener("install", (event) => {
    console.log("[SW] Installing service worker");

    event.waitUntil(
        (async () => {
            try {
                // Pre-cache the offline page immediately
                const cache = await caches.open(CACHE_NAMES.RUNTIME);
                await cache.add("/~offline");

                // Try to fetch and cache stories list, but don't block installation
                try {
                    const response = await fetch("/api/stories");
                    if (response.ok) {
                        const storiesCache = await caches.open(
                            CACHE_NAMES.STORIES_LIST
                        );
                        await storiesCache.put(
                            "/api/stories",
                            response.clone()
                        );

                        // Cache story pages in the background (non-blocking)
                        const stories: StorySelectType[] =
                            await response.json();
                        cacheStoryPages(stories).catch((err) =>
                            console.error(
                                "[SW] Failed to cache story pages:",
                                err
                            )
                        );
                    }
                } catch (error) {
                    console.warn(
                        "[SW] Could not fetch stories during install:",
                        error
                    );
                    // Don't fail installation if this fails
                }
            } catch (error) {
                console.error("[SW] Installation error:", error);
            }
        })()
    );
});

// Helper function to cache story pages (non-blocking)
async function cacheStoryPages(stories: StorySelectType[]) {
    const cache = await caches.open(CACHE_NAMES.STORY);
    const urls = stories.map((story) => `/story/${story.isbn}`);

    // Cache in batches to avoid overwhelming the browser
    const batchSize = 5;
    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        await Promise.allSettled(
            batch.map(async (url) => {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        await cache.put(url, response);
                    }
                } catch (error) {
                    console.warn(`[SW] Failed to cache ${url}:`, error);
                }
            })
        );
        // Small delay between batches
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
}

// Activate event - Clean up old caches
self.addEventListener("activate", (event) => {
    console.log("[SW] Activating service worker");

    event.waitUntil(
        (async () => {
            try {
                const cacheNames = await caches.keys();
                const validCacheNames = new Set<string>(
                    Object.values(CACHE_NAMES)
                );

                // Delete old caches
                await Promise.all(
                    cacheNames.map(async (cacheName) => {
                        if (
                            !validCacheNames.has(cacheName) &&
                            !cacheName.startsWith("serwist-precache-")
                        ) {
                            console.log("[SW] Deleting old cache:", cacheName);
                            await caches.delete(cacheName);
                        }
                    })
                );

                // Claim all clients immediately
                await self.clients.claim();

                console.log("[SW] Service worker activated");
            } catch (error) {
                console.error("[SW] Activation error:", error);
            }
        })()
    );
});

// Background sync queues
const notificationQueue = new BackgroundSyncQueue("notification-queue", {
    maxRetentionTime: 24 * 60, // 24 hours
    onSync: async ({ queue }) => {
        let entry;
        while ((entry = await queue.shiftRequest())) {
            try {
                await fetch(entry.request.clone());
                console.log("[SW] Replayed notification request");
            } catch (error) {
                console.error("[SW] Replay failed, re-queuing:", error);
                await queue.unshiftRequest(entry);
                throw error; // Re-throw to trigger retry
            }
        }
    },
});

const newStoryQueue = new BackgroundSyncQueue("new-story-queue", {
    maxRetentionTime: 72 * 60, // 72 hours
    onSync: async ({ queue }) => {
        let entry: BackgroundSyncQueueEntry | undefined;
        while ((entry = await queue.shiftRequest())) {
            try {
                const response = await fetch(entry.request.clone());
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                console.log("[SW] Replayed story request");

                // Notify the client of successful sync
                const clients = await self.clients.matchAll();
                clients.forEach((client) => {
                    client.postMessage({
                        type: "STORY_SYNCED",
                        url: entry?.request.url,
                    });
                });
            } catch (error) {
                console.error("[SW] Story replay failed, re-queuing:", error);
                await queue.unshiftRequest(entry);
                throw error;
            }
        }
    },
});

// Enhanced fetch handler
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests for notification and story endpoints
    // Handle them separately below
    if (request.method !== "GET") {
        // Queue notification API requests when offline
        if (url.pathname.includes("/api/notifications")) {
            event.respondWith(
                (async () => {
                    try {
                        const response = await fetch(request.clone());
                        return response;
                    } catch (error) {
                        console.log(
                            "[SW] Queuing notification for background sync",
                            error
                        );
                        await notificationQueue.pushRequest({
                            request: request.clone(),
                        });

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
                    }
                })()
            );
            return;
        }

        // Queue new story POST requests when offline
        if (url.pathname.startsWith("/story/") && request.method === "POST") {
            event.respondWith(
                (async () => {
                    try {
                        const response = await fetch(request.clone());
                        return response;
                    } catch (error) {
                        console.log(
                            "[SW] Queuing story for background sync",
                            error
                        );
                        await newStoryQueue.pushRequest({
                            request: request.clone(),
                        });

                        // Return a more informative error response
                        return new Response(
                            JSON.stringify({
                                queued: true,
                                offline: true,
                                message:
                                    "Your changes will be saved when you're back online",
                            }),
                            {
                                headers: { "Content-Type": "application/json" },
                                status: 202,
                            }
                        );
                    }
                })()
            );
            return;
        }
    }

    // For navigation requests, ensure we serve cached content when offline
    if (request.mode === "navigate") {
        event.respondWith(
            (async () => {
                try {
                    // Try network first
                    const response = await fetch(request.clone());

                    // Cache successful responses
                    if (response.ok && url.pathname.startsWith("/story/")) {
                        const cache = await caches.open(CACHE_NAMES.STORY);
                        cache.put(request, response.clone());
                    }

                    return response;
                } catch (error) {
                    // Network failed, try cache
                    console.log("[SW] Network failed, trying cache", error);
                    const cachedResponse = await caches.match(request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // No cache, return offline page
                    const offlineResponse = await caches.match("/~offline");
                    if (offlineResponse) {
                        return offlineResponse;
                    }

                    // Last resort fallback
                    return new Response(
                        "Offline - No cached version available",
                        {
                            status: 503,
                            statusText: "Service Unavailable",
                            headers: { "Content-Type": "text/plain" },
                        }
                    );
                }
            })()
        );
        return;
    }
});

// Handle sync events
self.addEventListener("sync", (event) => {
    console.log("[SW] Background sync event:", event.tag);

    if (event.tag === "notification-queue") {
        event.waitUntil(notificationQueue.replayRequests());
    } else if (event.tag === "new-story-queue") {
        event.waitUntil(newStoryQueue.replayRequests());
    }
});

// Enhanced push notification handler
self.addEventListener("push", (event: PushEvent) => {
    if (!event.data) {
        console.warn("[SW] Push event received without data");
        return;
    }

    try {
        const data = event.data.json();

        if (!data.title) {
            console.error("[SW] Push notification missing title");
            return;
        }

        const options: NotificationOptions = {
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
        console.error("[SW] Error processing push notification:", error);

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

    if (event.action === "close") {
        return;
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

                // Try to find and focus existing window with same URL
                for (const client of clientList) {
                    if (client.url === urlToOpen && "focus" in client) {
                        return await client.focus();
                    }
                }

                // Try to navigate an existing window
                if (clientList.length > 0) {
                    const client = clientList[0] as WindowClient;
                    if ("focus" in client && "navigate" in client) {
                        await client.focus();
                        return await client.navigate(urlToOpen);
                    }
                }

                // Open new window
                if (self.clients.openWindow) {
                    return await self.clients.openWindow(urlToOpen);
                }
            } catch (error) {
                console.error("[SW] Error handling notification click:", error);
            }
        })()
    );
});

// Handle notification close events
self.addEventListener("notificationclose", (event: NotificationEvent) => {
    console.log("[SW] Notification closed:", event.notification.tag);
});

// Message handler for client communication
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }

    if (event.data && event.data.type === "CLAIM_CLIENTS") {
        self.clients.claim();
    }

    if (event.data && event.data.type === "CACHE_URLS") {
        const urls = event.data.urls || [];
        event.waitUntil(
            (async () => {
                const cache = await caches.open(CACHE_NAMES.RUNTIME);
                await Promise.allSettled(
                    urls.map((url: string) => cache.add(url))
                );
            })()
        );
    }
});

// Initialize Serwist event listeners
serwist.addEventListeners();
