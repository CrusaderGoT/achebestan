import { NeonDbError } from "@neondatabase/serverless";
import { createSafeActionClient } from "next-safe-action";
import { PostgresError } from "postgres";

export const actionClient = createSafeActionClient({
    async handleServerError(e) {
        if (e instanceof NeonDbError || PostgresError) {
            console.error(e);

            return "a database error occured";
        }

        return e.message;
    },
});
