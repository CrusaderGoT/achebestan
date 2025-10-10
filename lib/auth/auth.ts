import { db } from "@/drizzle";
import { account, session, user, verification } from "@/drizzle/schemas/user";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { nextCookies } from "better-auth/next-js";
import { admin, anonymous, organization } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { getUserRole } from "../actions/user";
import { MEMBER_ROLES } from "../constants";
import {
    admin as adminRole,
    customAccessControl,
    user as userRole,
    writer,
} from "./permissions";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: {
            user,
            session,
            account,
            verification,
        },
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        nextCookies(),
        admin({
            customAccessControl,
            roles: {
                writer,
                userRole,
                adminRole,
            },
        }),
        organization({
            async allowUserToCreateOrganization(user) {
                const role = await getUserRole(user.id);

                return role === MEMBER_ROLES.superAdmin;
            },
        }),
        anonymous({
            disableDeleteAnonymousUser: true, // since the anon user is updated
            onLinkAccount: async ({ anonymousUser, newUser }) => {
                // delete new user to avoid conflicts, since we want just its details
                const [deletedNewUser] = await db
                    .delete(user)
                    .where(eq(user.id, newUser.user.id))
                    .returning();

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...details } = deletedNewUser;

                // update the anon user with deletedNewUser detail
                await db
                    .update(user)
                    .set({
                        ...details,
                        role: "user",
                        isAnonymous: false,
                    })
                    .where(eq(user.id, anonymousUser.user.id));
            },
        }),
    ],
    session: {
        cookieCache: {
            enabled: true,
        },
    },
    rateLimit: {
        window: 60,
        max: 50,
    },
});
