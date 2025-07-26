// drizzle/index.ts
import "dotenv/config";

import * as book from "@/drizzle/schemas/book";
import * as story from "@/drizzle/schemas/story";
import * as user from "@/drizzle/schemas/user";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString =
    process.env.NODE_ENV === "production"
        ? process.env.NEON_DATABASE_URL // Use Neon in production
        : process.env.LOCAL_DATABASE_URL; // Your local connection

if (!connectionString) {
    throw new Error("Database connection string not found");
}

const client = postgres(connectionString);

export const db = drizzle(client, {
    casing: "snake_case",
    schema: { ...story, ...user, ...book },
});
