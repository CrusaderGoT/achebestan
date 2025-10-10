"use server";

import { db } from "@/drizzle";

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
