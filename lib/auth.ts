import { db } from "@/drizzle";

import * as authSchemas from "@/drizzle/schemas/user";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";

import { user } from "@/drizzle/schemas/user";
import { nextCookies } from "better-auth/next-js";
import { admin, anonymous, organization } from "better-auth/plugins";
import { and, eq } from "drizzle-orm";
import {
    addUserToOrganization,
    checkIfOrganizationExist,
    checkIfUserIsMember,
    createOrganization,
    getUserRole as getUserRoles,
} from "./actions/auth";
import { ORG_ROLES } from "./constants";
import {
    admin as adminRole,
    customAccessControl,
    member,
    owner,
    superAdmin,
    writer,
} from "./auth/permissions";

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

export const orgName = "achebestan";
export const orgSlug = "achebestan";

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
                        let org = await checkIfOrganizationExist(orgSlug);

                        // Create organization if it doesn't exist
                        if (!org || org.length === 0) {
                            const newOrg = await createOrganization(
                                orgName,
                                orgSlug
                            );

                            org = [newOrg];
                            console.log(`Created organization: ${orgName}`);
                        }

                        // Check if user is already a member
                        const existingMember = await checkIfUserIsMember(
                            user.id,
                            org[0].id
                        );

                        // Add user to organization if not already a member
                        if (!existingMember || existingMember.length === 0) {
                            await addUserToOrganization(user.id, org[0].id);

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
                        // Try to find the org where the user is already a member
                        const [foundOrg] = await db
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

                        if (foundOrg) {
                            return {
                                data: {
                                    ...session,
                                    activeOrganizationId: foundOrg.id,
                                },
                            };
                        }

                        // Ensure the organization exists (create if missing)
                        let orgs = await checkIfOrganizationExist(orgSlug);
                        if (!orgs || orgs.length === 0) {
                            const newOrg = await createOrganization(
                                orgName,
                                orgSlug
                            );
                            orgs = [newOrg];
                            console.log(`Created organization: ${orgName}`);
                        }
                        const orgId = orgs[0].id;

                        // Ensure the user is a member (add if missing)
                        const member = await checkIfUserIsMember(
                            session.userId,
                            orgId
                        );
                        if (!member || member.length === 0) {
                            await addUserToOrganization(session.userId, orgId);
                            console.log(
                                `Added user ${session.userId} to organization ${orgName}`
                            );
                        }

                        return {
                            data: {
                                ...session,
                                activeOrganizationId: orgId,
                            },
                        };
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
