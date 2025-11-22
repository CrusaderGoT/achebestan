"use server";

import { db } from "@/drizzle";
import * as authSchemas from "@/drizzle/schemas/user";
import { generateId } from "better-auth";
import { and, eq } from "drizzle-orm";
import { canMakeOwner } from "../auth/policies/organization-policy";

export async function getUserRole(userId: string) {
    const role = await db.query.user
        .findFirst({
            where(fields, operators) {
                return operators.eq(fields.id, userId);
            },
        })
        .then((r) => r?.role);

    return role;
}

export async function checkIfOrganizationExist(orgSlug: string) {
    const org = await db
        .select()
        .from(authSchemas.organization)
        .where(eq(authSchemas.organization.slug, orgSlug))
        .limit(1);
    return org;
}

export async function createOrganization(orgName: string, orgSlug: string) {
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

    return newOrg;
}

export async function checkIfUserIsMember(userId: string, orgId: string) {
    const existingMember = await db
        .select()
        .from(authSchemas.member)
        .where(
            and(
                eq(authSchemas.member.userId, userId),
                eq(authSchemas.member.organizationId, orgId)
            )
        )
        .limit(1);

    return existingMember;
}

export async function addUserToOrganization(userId: string, orgId: string) {
    await db.insert(authSchemas.member).values({
        id: generateId(),
        organizationId: orgId,
        userId: userId,
        role: "member", // Change to "owner" for first user if desired
        createdAt: new Date(),
    });
}

export async function makeUserOwnerOfOrganizationIfNonExist(
    
    memberId: string,
    orgId: string
) {
    try {
        const perm = await canMakeOwner();

        if (!perm) return { sucess: false, failure: true, error: false };

        // check if owner role exists
        const existingOwner = await db.query.member.findFirst({
            where(fields, operators) {
                return operators.and(
                    operators.eq(fields.organizationId, orgId),
                    operators.eq(fields.role, "owner")
                );
            },
        });

        // Only insert if no owner exists and user is a site admin
        if (!existingOwner) {
            await db
                .update(authSchemas.member)
                .set({
                    role: "owner",
                })
                .where(
                    and(
                        eq(authSchemas.member.id, memberId),
                        eq(authSchemas.member.organizationId, orgId)
                    )
                );
            return { sucess: true, failure: false, error: false };
        } else {
            return { sucess: false, failure: true, error: false };
        }
    } catch (e) {
        console.log(
            "An Error Ocurred During makeUserOwnerOfOrganizationIfNonExist",
            e
        );

        return { sucess: false, failure: true, error: true };
    }
}
