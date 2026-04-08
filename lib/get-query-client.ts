import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

// cache() scopes one instance per server request —
// safe to call in Server Components
export const getQueryClient = cache(
    () =>
        new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 60 * 1000, // 1 min
                },
            },
        }),
);
