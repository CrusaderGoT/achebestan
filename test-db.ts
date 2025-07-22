// test-db.ts - Run this to test your database connection
import { db } from "./drizzle/index";
import { sql } from "drizzle-orm";

async function testConnection() {
    // Debug environment variables
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("POSTGRES_URL exists:", !!process.env.POSTGRES_URL);
    console.log("LOCAL_POSTGRES_URL exists:", !!process.env.LOCAL_POSTGRES_URL);

    try {
        const result = await db.execute(sql`SELECT NOW() as current_time`);
        console.log("✅ Database connection successful:", result);
    } catch (error) {
        console.error("❌ Database connection failed:", error);
    }
}

testConnection();
