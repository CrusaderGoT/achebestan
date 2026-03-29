import {
    adminClient,
    anonymousClient,
    organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
    admin as adminRole,
    customAccessControl,
    member,
    owner,
    superAdmin,
    writer,
} from "./auth/permissions";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    fetchOptions: {
        credentials: "include",
    },
    plugins: [
        adminClient({
            ac: customAccessControl,
            roles: {
                superAdmin,
                admin: adminRole,
            },
        }),
        organizationClient({
            ac: customAccessControl,
            roles: {
                writer,
                admin: adminRole,
                owner,
                member,
            },
        }),
        anonymousClient(),
    ],
});

// Export types for convenience
export type AuthClient = typeof authClient;
