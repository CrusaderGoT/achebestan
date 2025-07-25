"use server";

import { userUpdateSchema } from "@/zod-schemas/user";
import { auth } from "../auth";
import { authActionClient } from "../safe-action";

export const createBookAction = authActionClient
    .inputSchema(userUpdateSchema)
    .action(async ({ parsedInput: { ...inputData }, ctx }) => {
        await auth.api.updateUser({
            body: {
                name: inputData.name || ctx.user.name,
                image:
                    inputData.image || !ctx.user.image
                        ? undefined
                        : ctx.user.image,
            },
        });

        return "user has been updated successfully";
    });
