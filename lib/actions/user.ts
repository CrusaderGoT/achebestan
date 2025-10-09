"use server";

import { userUpdateSchema } from "@/zod-schemas/user";
import { auth } from "../auth/auth";
import { authActionClient } from "../safe-action";
import { db } from "@/drizzle";

export const updateUserAction = authActionClient
    .inputSchema(userUpdateSchema)
    .action(async ({ parsedInput: { ...inputData }, ctx }) => {
        const { status } = await auth.api.updateUser({
            body: {
                name: inputData.name || ctx.user.name,
                image:
                    inputData.image || !ctx.user.image
                        ? undefined
                        : ctx.user.image,
            },
        });

        if (status) {
            return "User Has Been Updated Successfully";
        } else {
            throw new Error("User Update Failed");
        }
    });

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
