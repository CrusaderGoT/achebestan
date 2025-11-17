import { db } from "@/drizzle";

import * as authSchemas from "@/drizzle/schemas/user";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";

import { user } from "@/drizzle/schemas/user";
import { generateId } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin, anonymous, organization } from "better-auth/plugins";
import { and, eq } from "drizzle-orm";
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

const orgName = "achebestan";
const orgSlug = "achebestan";

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
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    try {
                        // Check if organization exists
                        let org = await db
                            .select()
                            .from(authSchemas.organization)
                            .where(eq(authSchemas.organization.slug, orgSlug))
                            .limit(1);

                        // Create organization if it doesn't exist
                        if (!org || org.length === 0) {
                            const [newOrg] = await db
                                .insert(authSchemas.organization)
                                .values({
                                    id: generateId(),
                                    name: orgName,
                                    slug: orgSlug,
                                    createdAt: new Date(),
                                    metadata: JSON.stringify({
                                        defaultOrg: true,
                                    }),
                                })
                                .returning();

                            org = [newOrg];
                            console.log(`Created organization: ${orgName}`);
                        }

                        // Check if user is already a member
                        const existingMember = await db
                            .select()
                            .from(authSchemas.member)
                            .where(
                                and(
                                    eq(authSchemas.member.userId, user.id),
                                    eq(
                                        authSchemas.member.organizationId,
                                        org[0].id
                                    )
                                )
                            )
                            .limit(1);

                        // Add user to organization if not already a member
                        if (!existingMember || existingMember.length === 0) {
                            await db.insert(authSchemas.member).values({
                                id: generateId(),
                                organizationId: org[0].id,
                                userId: user.id,
                                role: "member", // Change to "owner" for first user if desired
                                createdAt: new Date(),
                            });

                            console.log(
                                `Added user ${user.id} to organization ${orgName}`
                            );
                        }
                    } catch (error) {
                        console.error(
                            "Failed to add user to organization:",
                            error
                        );
                    }
                },
            },
        },
        session: {
            create: {
                before: async (session) => {
                    try {
                        // Find the achebestan organization for this user
                        const org = await db
                            .select({
                                id: authSchemas.organization.id,
                                name: authSchemas.organization.name,
                            })
                            .from(authSchemas.organization)
                            .innerJoin(
                                authSchemas.member,
                                eq(
                                    authSchemas.organization.id,
                                    authSchemas.member.organizationId
                                )
                            )
                            .where(
                                and(
                                    eq(authSchemas.organization.slug, orgSlug),
                                    eq(
                                        authSchemas.member.userId,
                                        session.userId
                                    )
                                )
                            )
                            .limit(1);

                        // Set achebestan as active organization
                        if (org && org.length > 0) {
                            return {
                                data: {
                                    ...session,
                                    activeOrganizationId: org[0].id,
                                },
                            };
                        }

                        return { data: session };
                    } catch (error) {
                        console.error(
                            "Failed to set active organization:",
                            error
                        );
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
    },
});
