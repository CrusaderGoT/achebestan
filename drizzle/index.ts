// drizzle/index.ts
import "dotenv/config";

import * as book from "@/drizzle/schemas/book";
import * as comment from "@/drizzle/schemas/comment";
import * as rating from "@/drizzle/schemas/rating";
import * as reaction from "@/drizzle/schemas/reaction";
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

// Declare global variable for development singleton
declare global {
    var __drizzleClient: postgres.Sql | undefined;
}

// Configure postgres client with proper connection pooling
const clientConfig = {
    max: process.env.NODE_ENV === "production" ? 20 : 1, // Limit connections
    idle_timeout: 20, // Close idle connections after 20 seconds
    max_lifetime: 60 * 30, // Close connections after 30 minutes
    connect_timeout: 10, // Connection timeout in seconds
};

let client: postgres.Sql;

if (process.env.NODE_ENV === "production") {
    // In production, create a new client
    client = postgres(connectionString, clientConfig);
} else {
    // In development, use singleton pattern to prevent multiple connections
    if (!global.__drizzleClient) {
        global.__drizzleClient = postgres(connectionString, {
            ...clientConfig,
            max: 1, // Only 1 connection in development
        });
    }
    client = global.__drizzleClient;
}

export const db = drizzle(client, {
    casing: "snake_case",
    schema: { ...story, ...user, ...book, ...rating, ...comment, ...reaction },
});

// Connection cleanup for graceful shutdown
if (process.env.NODE_ENV === "production") {
    process.on("beforeExit", async () => {
        await client.end();
    });
}
