"use server";

import { bookInsertSchema } from "@/zod-schemas/book";
import { actionClient } from "../safe-action";

export const createBookAction = actionClient
    .metadata({ actionName: "createBookAction", user: "anon" })
    .inputSchema(bookInsertSchema)
    .action(async ({ parsedInput: { ...inputData } }) => {
        return {
            message: `${inputData}`,
        };
    });

    