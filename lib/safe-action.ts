import { actionMetadatSchema } from "@/drizzle/schemas/base";
import { NeonDbError } from "@neondatabase/serverless";
import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
    async handleServerError(e) {
        if (e instanceof NeonDbError) {
            console.error(e);

            return "a database error occured";
        }

        return e.message;
    },

    defineMetadataSchema() {
        return actionMetadatSchema;
    },
});
