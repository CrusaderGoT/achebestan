import { drizzle } from "drizzle-orm/neon-http";

export const db = drizzle({
    connection: process.env.NODE_ENV === "production"
        ? process.env.POSTGRES_URL as string
        : process.env.LOCAL_POSTGRES_URL as string,
    casing: "snake_case",
});
