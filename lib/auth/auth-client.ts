import {
    adminClient,
    anonymousClient,
    organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
    admin as adminRole,
    customAccessControl,
    user as userRole,
    writer,
} from "./permissions";

export const authClient = createAuthClient({
    plugins: [
        adminClient(),
        anonymousClient(),
        organizationClient({
            ac: customAccessControl,
            roles: {
                writer,
                userRole,
                adminRole,
            },
        }),
    ],
});
