import { db } from "@/drizzle";

import * as authSchemas from "@/drizzle/schemas/user";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";

import { user } from "@/drizzle/schemas/user";
import { nextCookies } from "better-auth/next-js";
import { admin, anonymous, organization } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { getUserRole as getUserRoles } from "./actions/user";
import {
    admin as adminRole,
    customAccessControl,
    member,
    owner,
    superAdmin,
    user as userRole,
    writer,
} from "./auth/permissions";
import { ORG_ROLES } from "./constants";

import "dotenv/config";

const envadminIdList = process.env.ADMIN_IDS;

let adminIdList: string[] = [];

if (envadminIdList) {
    try {
        adminIdList = JSON.parse(envadminIdList);
    } catch (e) {
        console.log("Failed to parse ADMIN_IDS", e);
    }
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: {
            ...authSchemas,
        },
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        nextCookies(),
        admin({
            ac: customAccessControl,
            roles: {
                writer,
                user: userRole,
                admin: adminRole,
                owner,
                superAdmin,
                member,
            },
            defaultRole: "user",
            adminRoles: ["admin", "superAdmin"],
            adminUserIds: adminIdList,
        }),
        organization({
            ac: customAccessControl,
            roles: {
                writer,
                user: userRole,
                admin: adminRole,
                owner,
                superAdmin,
                member,
            },
            async allowUserToCreateOrganization(user) {
                const roles = await getUserRoles(user.id);

                if (!roles) return false;

                return roles.includes(ORG_ROLES.superAdmin);
            },
            organizationCreation: {
                beforeCreate: async ({ organization: org, user }) => {
                    // check if name exists already
                    const exists = await db.query.organization.findFirst({
                        where(fields, operators) {
                            return operators.eq(fields.name, org.name);
                        },
                    });

                    if (exists) {
                        throw new APIError("CONFLICT", {
                            message: "Organization Name Is Already Taken",
                        });
                    }
                    return {
                        data: {
                            ...org,
                            metadata: {
                                createdBy: user,
                            },
                        },
                    };
                },
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
