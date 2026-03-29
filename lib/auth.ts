import { db } from "@/drizzle";

import * as authSchemas from "@/drizzle/schemas/user";
import { betterAuth, generateId } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";

import { user } from "@/drizzle/schemas/user";
import { nextCookies } from "better-auth/next-js";
import { admin, anonymous, organization } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import {
    addUserToOrganization,
    checkIfUserIsMember,
    getUserRole as getUserRoles,
} from "./actions/auth";
import {
    admin as adminRole,
    customAccessControl,
    member,
    owner,
    superAdmin,
    writer,
} from "./auth/permissions";
import { ORG_ROLES } from "./constants";

import "dotenv/config";

const adminIdList = (() => {
    try {
        const ids = JSON.parse(process.env.ADMIN_IDS || "[]");
        return Array.isArray(ids) ? ids : [];
    } catch {
        console.error("Invalid ADMIN_IDS format");
        return [];
    }
})();

export const orgName = "achebestan";
export const orgSlug = "achebestan";

export const auth = betterAuth({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
        admin({
            ac: customAccessControl,
            roles: {
                superAdmin,
                admin: adminRole,
            },
            adminRoles: ["admin", "superAdmin"],
            adminUserIds: adminIdList,
        }),
        organization({
            ac: customAccessControl,
            roles: {
                writer,
                admin: adminRole,
                owner,
                member,
            },
            async allowUserToCreateOrganization(user) {
                const roles = await getUserRoles(user.id);

                if (!roles) return false;

                return roles.includes(ORG_ROLES.superAdmin);
            },
            organizationHooks: {
                beforeCreateOrganization: async ({ organization, user }) => {
                    const exists = await db.query.organization.findFirst({
                        where: eq(
                            authSchemas.organization.name,
                            organization.name || ""
                        ),
                    });

                    if (exists) {
                        throw new APIError("CONFLICT", {
                            message: "Organization Name Is Already Taken",
                        });
                    }

                    return {
                        data: {
                            ...organization,
                            metadata: { createdBy: user },
                        },
                    };
                },
            },
        }),
        anonymous({
            disableDeleteAnonymousUser: true,
            onLinkAccount: async ({ anonymousUser, newUser }) => {
                await db.transaction(async (tx) => {
                    // Delete new user
                    const [deletedNewUser] = await tx
                        .delete(user)
                        .where(eq(user.id, newUser.user.id))
                        .returning();

                    if (!deletedNewUser)
                        throw new Error("Failed to delete new user");

                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...details } = deletedNewUser;

                    // Update anonymous user
                    await tx
                        .update(user)
                        .set({
                            ...details,
                            role: "user",
                            isAnonymous: false,
                        })
                        .where(eq(user.id, anonymousUser.user.id));
                });
            },
        }),
        nextCookies(),
    ],
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    try {
                        // Use a transaction or unique constraint to prevent race conditions
                        const org = await db.transaction(async (tx) => {
                            // Check again inside transaction
                            const existing =
                                await tx.query.organization.findFirst({
                                    where: eq(
                                        authSchemas.organization.slug,
                                        orgSlug
                                    ),
                                });

                            if (existing) return existing;

                            // Create if not exists
                            const [newOrg] = await tx
                                .insert(authSchemas.organization)
                                .values({
                                    id: generateId(),
                                    name: orgName,
                                    slug: orgSlug,
                                    createdAt: new Date(),
                                })
                                .returning();
                            return newOrg;
                        });

                        // Check membership and add if needed
                        const existingMember = await checkIfUserIsMember(
                            user.id,
                            org.id
                        );
                        if (!existingMember?.length) {
                            await addUserToOrganization(user.id, org.id);
                        }
                    } catch (error) {
                        console.error(
                            "Failed to setup user organization:",
                            error
                        );
                        // Consider: should user creation fail if org setup fails?
                        // throw error; // Uncomment if this is critical
                    }
                },
            },
        },
        session: {
            create: {
                before: async (session) => {
                    try {
                        // Just find existing membership - don't create here
                        const [member] = await db
                            .select({
                                orgId: authSchemas.member.organizationId,
                            })
                            .from(authSchemas.member)
                            .where(
                                eq(authSchemas.member.userId, session.userId)
                            )
                            .limit(1);
                        if (member) {
                            return {
                                data: {
                                    ...session,
                                    activeOrganizationId: member.orgId,
                                },
                            };
                        }
                        return { data: session };
                    } catch (error) {
                        console.error("Failed to set active org:", error);
                        return { data: session };
                    }
                },
            },
        },
    },
    session: {
        cookieCache: {
            enabled: true,
        },
    },
    rateLimit: {
        window: 60,
        max: 50,
        customRules: {
            "/sign-in/email": { window: 60 * 15, max: 5 }, // Stricter for login
            "/sign-up/email": { window: 60 * 60, max: 3 }, // Very strict for signup
        },
    },
});
