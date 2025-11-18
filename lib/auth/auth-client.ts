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
    user as userRole,
    writer,
} from "./permissions";

export const authClient = createAuthClient({
    plugins: [
        adminClient({
            ac: customAccessControl,
            roles: {
                writer,
                user: userRole,
                admin: adminRole,
                owner,
                superAdmin,
                member,
            },
        }),
        anonymousClient(),
        organizationClient({
            ac: customAccessControl,
            roles: {
                writer,
                user: userRole,
                admin: adminRole,
                owner,
                superAdmin,
                member,
            },
        }),
    ],
});
