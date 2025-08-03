import { createSafeActionClient } from "next-safe-action";
import { headers } from "next/headers";
import { auth } from "./auth";

export const actionClient = createSafeActionClient({
    async handleServerError(e) {
        if (e.name === "PostgresError") {
            console.error(e);

            return "a database error occurred";
        }
        console.error(e);

        return e.message;
    },
});

export const authActionClient = actionClient.use(async ({ next }) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Session not found!");
    }

    if (!session.user.id) {
        throw new Error("Session is not valid!");
    }

    return next({ ctx: { user: session.user } });
});
