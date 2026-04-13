import { QueryClient } from "@tanstack/react-query";

// cache() scopes one instance per server request —
// safe to call in Server Components
export const getQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 min
            },
        },
    });
