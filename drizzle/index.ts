import { drizzle } from "drizzle-orm/neon-http";

export const db = drizzle({
    connection: process.env.LOCAL_POSTGRES_URL as string,
    casing: "snake_case",
});
