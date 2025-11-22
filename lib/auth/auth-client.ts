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
} from "./permissions";

export const authClient = createAuthClient({
    plugins: [
        adminClient({
            ac: customAccessControl,
            roles: {
                superAdmin,
                admin: adminRole,
            },
        }),
        anonymousClient(),
        organizationClient({
            ac: customAccessControl,
            roles: {
                writer,
                admin: adminRole,
                owner,
                member,
            },
        }),
    ],
});
