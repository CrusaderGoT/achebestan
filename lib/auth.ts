import { db } from "@/drizzle";
import { account, session, user, verification } from "@/drizzle/schemas/user";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: {
            user,
            session,
            account,
            verification,
        },
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [nextCookies()],
    session: {
        cookieCache: {
            enabled: true,
        },
    },
    rateLimit: {
        window: 60,
        max: 50,
    },
});
