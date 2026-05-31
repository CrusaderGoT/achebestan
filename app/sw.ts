/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
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
} from "serwist";
import type { StorySelectType } from "../types/story";

// Declare the value of `injectionPoint` to TypeScript.
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

// ---------------------------------------------------------------------------
// Cache name constants — increment the suffix to force a full cache refresh
// ---------------------------------------------------------------------------
const CACHE_NAMES = {
    IMAGES: "images-v2",
    API: "api-cache-v2",
    STORY: "story-page-v2",
    STORIES_LIST: "stories-list-v2",
    RUNTIME: "runtime-v2",
} as const;

// ---------------------------------------------------------------------------
// Serwist instance — v9.x uses `new Serwist()` + `serwist.addEventListeners()`
// `createSerwist`, `RuntimeCache`, and the standalone `addEventListeners`
// export were removed in v9. All runtime-caching config lives here.
// ---------------------------------------------------------------------------
const serwist = new Serwist({
    // Precache entries injected at build time by @serwist/turbopack.
    // Additional URLs (e.g. /~offline) should be added via
    // `additionalPrecacheEntries` in app/serwist/[path]/route.ts, NOT here,
    // so that Serwist can version them properly.
    precacheEntries: self.__SW_MANIFEST,
    precacheOptions: {
        concurrency: 10,
        cleanupOutdatedCaches: true,
    },

    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    disableDevLogs: true,

    // -------------------------------------------------------------------------
    // Runtime caching — evaluated top-to-bottom; first match wins.
    // defaultCache entries from @serwist/turbopack/worker are spread at the
    // END so that our specific rules take precedence.
    // -------------------------------------------------------------------------
    runtimeCaching: [
        // Story pages — fast load from cache, refresh in background
        {
            matcher: ({ url }) =>
                url.pathname.startsWith("/stories/") &&
                !url.pathname.includes("new"),
            handler: new StaleWhileRevalidate({
                cacheName: CACHE_NAMES.STORY,
                plugins: [
                    new CacheableResponsePlugin({ statuses: [0, 200] }),
                    new ExpirationPlugin({
                        maxEntries: 50,
                        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                        purgeOnQuotaError: true,
                    }),
                ],
                networkTimeoutSeconds: 3,
            }),
        },

        // Stories list API — network-first, fall back to cache after 5 s
        {
            matcher: ({ url }) => url.pathname === "/api/stories",
            handler: new NetworkFirst({
                cacheName: CACHE_NAMES.STORIES_LIST,
                plugins: [
                    new CacheableResponsePlugin({ statuses: [0, 200] }),
                    new ExpirationPlugin({
                        maxEntries: 1,
                        maxAgeSeconds: 24 * 60 * 60, // 1 day
                    }),
                ],
                networkTimeoutSeconds: 5,
            }),
        },

        // Images — cache-first for maximum performance
        {
            matcher: ({ request }) => request.destination === "image",
            handler: new CacheFirst({
                cacheName: CACHE_NAMES.IMAGES,
                plugins: [
                    new CacheableResponsePlugin({ statuses: [0, 200] }),
                    new ExpirationPlugin({
                        maxEntries: 100,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                        purgeOnQuotaError: true,
                    }),
                ],
            }),
        },

        // All other API routes (excluding stories — those are handled
        // below via BackgroundSync, so they must not be cached here)
        {
            matcher: ({ url }) =>
                url.pathname.startsWith("/api/") &&
                url.pathname !== "/api/stories",
            handler: new NetworkFirst({
                cacheName: CACHE_NAMES.API,
                plugins: [
                    new CacheableResponsePlugin({ statuses: [0, 200] }),
                    new ExpirationPlugin({
                        maxEntries: 50,
                        maxAgeSeconds: 5 * 60, // 5 minutes
                    }),
                ],
                networkTimeoutSeconds: 3,
            }),
        },

        // Framework defaults (fonts, _next/static, etc.) come last
        ...defaultCache,
    ],

    // Navigation fallback — served when the network is offline and no cached
    // version of the page exists. Serwist's own fallback system handles this;
    // no need for a duplicate manual navigate handler in the fetch listener.
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

// ---------------------------------------------------------------------------
// Wire Serwist's standard event listeners explicitly so we can layer our own
// without conflicts. Using the individual handler refs avoids the
// double-respondWith bug that occurs when both serwist.addEventListeners()
// AND manual fetch/activate listeners are registered simultaneously.
// ---------------------------------------------------------------------------
self.addEventListener("install", serwist.handleInstall);
self.addEventListener("activate", serwist.handleActivate);

// IMPORTANT: Only one listener may call event.respondWith() per fetch event.
// serwist.handleFetch manages all GET caching and the /~offline fallback.
// Our custom listener below handles non-GET offline queuing only and never
// calls event.respondWith() for GET requests, so there is no conflict.
self.addEventListener("fetch", serwist.handleFetch);

// Serwist's handleCache responds to CACHE_URLS messages used internally by
// SerwistProvider. Our custom message handler (below) handles a separate set
// of message types, so both can co-exist safely.
self.addEventListener("message", serwist.handleCache);

// ---------------------------------------------------------------------------
// Custom install: pre-warm the stories list and story pages.
// Stacking a second event.waitUntil() is safe and does not conflict with
// Serwist's install handler (which runs the precache logic).
// ---------------------------------------------------------------------------
self.addEventListener("install", (event: ExtendableEvent) => {
    console.log("[SW] Custom install: pre-warming story caches");

    event.waitUntil(
        (async () => {
            // Pre-cache the offline page in the runtime cache as a safety net
            // (it will also be precached by Serwist via additionalPrecacheEntries)
            try {
                const runtimeCache = await caches.open(CACHE_NAMES.RUNTIME);
                await runtimeCache.add("/~offline");
            } catch (err) {
                console.warn("[SW] Could not cache /~offline:", err);
            }

            // Fetch and cache the stories list + individual story pages.
            // Failures here must not block installation.
            try {
                const response = await fetch("/api/stories");
                if (!response.ok) return;

                const storiesCache = await caches.open(
                    CACHE_NAMES.STORIES_LIST,
                );
                // Store the response in the stories cache using a clone so the
                // body stream is still readable when we call .json() below.
                await storiesCache.put("/api/stories", response.clone());

                const stories: StorySelectType[] = await response.json();
                // Non-blocking: cache individual story pages in the background
                cacheStoryPages(stories).catch((err) =>
                    console.error("[SW] Failed to cache story pages:", err),
                );
            } catch (err) {
                console.warn(
                    "[SW] Could not pre-warm stories during install:",
                    err,
                );
            }
        })(),
    );
});

// ---------------------------------------------------------------------------
// Helper — cache individual story pages in small batches
// ---------------------------------------------------------------------------
async function cacheStoryPages(stories: StorySelectType[]): Promise<void> {
    const cache = await caches.open(CACHE_NAMES.STORY);
    const urls = stories.map((story) => `/stories/${story.isbn}`);

    const BATCH_SIZE = 5;
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        const batch = urls.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(
            batch.map(async (url) => {
                try {
                    const res = await fetch(url);
                    if (res.ok) {
                        await cache.put(url, res);
                    }
                } catch (err) {
                    console.warn(
                        `[SW] Failed to cache story page ${url}:`,
                        err,
                    );
                }
            }),
        );
        // Small breathing room between batches
        await new Promise<void>((resolve) => setTimeout(resolve, 100));
    }
}

// ---------------------------------------------------------------------------
// Background sync queues — offline mutation support
// ---------------------------------------------------------------------------
const notificationQueue = new BackgroundSyncQueue("notification-queue", {
    maxRetentionTime: 24 * 60, // 24 hours in minutes
    onSync: async ({ queue }) => {
        let entry: BackgroundSyncQueueEntry | undefined;
        while ((entry = await queue.shiftRequest())) {
            try {
                await fetch(entry.request.clone());
                console.log("[SW] Replayed notification request");
            } catch (err) {
                console.error(
                    "[SW] Notification replay failed, re-queuing:",
                    err,
                );
                await queue.unshiftRequest(entry);
                throw err; // Re-throw so the browser retries the sync
            }
        }
    },
});

const newStoryQueue = new BackgroundSyncQueue("new-story-queue", {
    maxRetentionTime: 72 * 60, // 72 hours in minutes
    onSync: async ({ queue }) => {
        let entry: BackgroundSyncQueueEntry | undefined;
        while ((entry = await queue.shiftRequest())) {
            try {
                const response = await fetch(entry.request.clone());
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                console.log("[SW] Replayed story request");

                // Notify all open clients that their story was synced
                const clients = await self.clients.matchAll();
                clients.forEach((client) => {
                    client.postMessage({
                        type: "STORY_SYNCED",
                        url: entry?.request.url,
                    });
                });
            } catch (err) {
                console.error("[SW] Story replay failed, re-queuing:", err);
                await queue.unshiftRequest(entry);
                throw err;
            }
        }
    },
});

// ---------------------------------------------------------------------------
// Custom fetch handler — non-GET offline queuing only.
//
// serwist.handleFetch (registered above) handles all GET caching and the
// offline navigation fallback. This listener intercepts non-GET requests for
// specific endpoints when the network is unavailable and queues them for
// background sync. It returns early (does nothing) for GET requests so there
// is no risk of a double event.respondWith() error.
// ---------------------------------------------------------------------------
self.addEventListener("fetch", (event: FetchEvent) => {
    const { request } = event;

    // Let serwist.handleFetch deal with all GET requests
    if (request.method === "GET") return;

    const url = new URL(request.url);

    // Queue offline story POST/PATCH/DELETE mutations
    if (url.pathname.startsWith("/stories/new")) {
        event.respondWith(
            (async () => {
                try {
                    return await fetch(request.clone());
                } catch (err) {
                    console.log(
                        "[SW] Queuing story mutation for background sync:",
                        err,
                    );
                    await newStoryQueue.pushRequest({
                        request: request.clone(),
                    });
                    return new Response(
                        JSON.stringify({
                            queued: true,
                            offline: true,
                            message:
                                "Your story will be published when you're back online",
                        }),
                        {
                            headers: { "Content-Type": "application/json" },
                            status: 202,
                        },
                    );
                }
            })(),
        );
        return;
    }
});

// ---------------------------------------------------------------------------
// Background sync replay (triggered by the browser when connectivity returns)
// ---------------------------------------------------------------------------
self.addEventListener("sync", (event: SyncEvent) => {
    console.log("[SW] Background sync event:", event.tag);

    if (event.tag === "notification-queue") {
        event.waitUntil(notificationQueue.replayRequests());
    } else if (event.tag === "new-story-queue") {
        event.waitUntil(newStoryQueue.replayRequests());
    }
});

// ---------------------------------------------------------------------------
// Push notification handler
// ---------------------------------------------------------------------------
self.addEventListener("push", (event: PushEvent) => {
    if (!event.data) {
        console.warn("[SW] Push event received without data");
        return;
    }

    try {
        const data = event.data.json();

        if (!data.title) {
            console.error(
                "[SW] Push notification missing required `title` field",
            );
            return;
        }

        // Build notification options with the correct types.
        // `actions` must be NotificationAction[], not string[].
        const options: NotificationOptions & {
            vibrate: number[];
            actions: []; //NotificationAction[];
            renotify: boolean;
            timestamp: number;
        } = {
            body: data.body ?? "",
            icon: data.icon ?? "/web-app-manifest-512x512.png",
            badge: data.badge ?? "/web-app-manifest-192x192.png",
            vibrate: [200, 100, 200],
            tag: data.tag ?? `notification-${Date.now()}`,
            data: {
                url: data.url ?? "/",
                ...data.data,
            },
            actions: data.actions ?? [], //as NotificationAction[],
            requireInteraction: data.requireInteraction ?? false,
            silent: data.silent ?? false,
            renotify: data.renotify ?? false,
            timestamp: Date.now(),
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options),
        );
    } catch (err) {
        console.error("[SW] Error processing push notification:", err);

        // Fallback notification so the user is never silently dropped
        event.waitUntil(
            self.registration.showNotification("New Notification", {
                body: "You have a new notification",
                icon: "/web-app-manifest-192x192.png",
            }),
        );
    }
});

// ---------------------------------------------------------------------------
// Notification click handler
// ---------------------------------------------------------------------------
self.addEventListener("notificationclick", (event: NotificationEvent) => {
    event.notification.close();

    if (event.action === "close") return;

    const urlToOpen = new URL(
        event.notification.data?.url ?? "/",
        self.location.origin,
    ).href;

    event.waitUntil(
        (async () => {
            try {
                const clientList = await self.clients.matchAll({
                    type: "window",
                    includeUncontrolled: true,
                });

                // Reuse an existing tab that is already on this URL
                for (const client of clientList) {
                    if (client.url === urlToOpen && "focus" in client) {
                        return await (client as WindowClient).focus();
                    }
                }

                // Navigate an existing (unrelated) tab rather than opening a new one
                if (clientList.length > 0) {
                    const client = clientList[0] as WindowClient;
                    if ("focus" in client && "navigate" in client) {
                        await client.focus();
                        return await client.navigate(urlToOpen);
                    }
                }

                // Last resort: open a brand-new tab
                if (self.clients.openWindow) {
                    return await self.clients.openWindow(urlToOpen);
                }
            } catch (err) {
                console.error("[SW] Error handling notification click:", err);
            }
        })(),
    );
});

// ---------------------------------------------------------------------------
// Notification close handler
// ---------------------------------------------------------------------------
self.addEventListener("notificationclose", (event: NotificationEvent) => {
    console.log("[SW] Notification dismissed:", event.notification.tag);
});

// ---------------------------------------------------------------------------
// Custom message handler — handles our own message types.
// serwist.handleCache (registered above) already responds to CACHE_URLS
// messages used by SerwistProvider, so we only deal with our own here.
// ---------------------------------------------------------------------------
self.addEventListener("message", (event: ExtendableMessageEvent) => {
    if (!event.data) return;

    // Manually trigger skip-waiting (useful for update prompts in the UI)
    if (event.data.type === "SKIP_WAITING") {
        void self.skipWaiting();
    }

    // Manually claim all clients (rarely needed since clientsClaim: true is set)
    if (event.data.type === "CLAIM_CLIENTS") {
        void self.clients.claim();
    }
});
