"use server";

import { db } from "@/drizzle";
import { organization } from "@/drizzle/schemas/user";
import { nanoid } from "nanoid";

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

export async function getAnyUserOrganization(userId: string) {
    const userOrg = await db.query.member.findFirst({
        where(fields, operators) {
            return operators.eq(fields.userId, userId);
        },
        with: {
            organization: true,
        },
    });

    return userOrg?.organizationId;
}

export async function getDefaultOrganization() {
    const org = await db.query.organization.findFirst();

    return org?.id;
}

export async function createDefaultOrganization() {
    const orgId = nanoid(25);

    const [createDefOrg] = await db
        .insert(organization)
        .values({
            id: orgId,
            name: "Achebestan",
            slug: "achebestan",
            createdAt: new Date(),
        })
        .returning();

    return createDefOrg?.id;
}
