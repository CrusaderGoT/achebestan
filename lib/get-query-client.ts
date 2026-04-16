import {
    QueryClient
} from "@tanstack/react-query";

export const getQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                // Since it's a story site, content doesn't change every second.
                // 5 minutes is a sweet spot for "stale" content.
                staleTime: 5 * 60 * 1000,

                // Keep unused data in memory for 10 minutes.
                gcTime: 10 * 60 * 1000,

                // Prevents aggressive refetching when users switch tabs
                // (Great for reading long stories without jumps).
                refetchOnWindowFocus: false,

                // Retry failed fetches twice before showing an error.
                retry: 2,
            },
            mutations: {
                // BetterAuth sessions/Story updates usually shouldn't retry
                // if they fail with a 4xx error.
                retry: false,
            },
        },
    });
