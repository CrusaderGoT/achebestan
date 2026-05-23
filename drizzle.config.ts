// drizzle.config.ts
import "dotenv/config";

import { defineConfig } from "drizzle-kit";
import { isProduction } from "./lib/constants";

const url = isProduction
    ? process.env.NEON_DATABASE_URL
    : process.env.LOCAL_DATABASE_URL;

if (!url) {
    throw new Error(
        `Database URL not found for ${
            isProduction ? "production" : "development"
        } environment`,
    );
}

export default defineConfig({
    dialect: "postgresql",
    dbCredentials: { url },
    casing: "snake_case",
    schema: "./drizzle/schemas/",
    out: "./drizzle/migrations",
    verbose: true,
    strict: true,
});
