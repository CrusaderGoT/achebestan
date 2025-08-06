"use server";

import { userUpdateSchema } from "@/zod-schemas/user";
import { auth } from "../auth";
import { authActionClient } from "../safe-action";

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
