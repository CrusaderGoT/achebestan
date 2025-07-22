"use server";

import { bookInsertSchema,  } from "@/drizzle/schemas/book";
import { actionClient } from "../safe-action";

export const createBookAction = actionClient
    .metadata({ actionName: "createBookAction", user: "anon" })
    .inputSchema(bookInsertSchema)
    .action(async ({ parsedInput: { ...inputData }, metadata }) => {
        return {
            message: `${inputData}`,
        };
    });
