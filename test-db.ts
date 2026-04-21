// test-db.ts - Updated test
import "dotenv/config";

import { db } from "./drizzle/index";
import { user } from "./drizzle/schemas/user";

async function testConnection() {
    console.log("Testing database connection...");
    console.log("NODE_ENV:", process.env.NODE_ENV || "development");

    try {
        // Test with a simple query
        const result = await db.execute("SELECT 1 as test, NOW() as timestamp");
        console.log("✅ Database connection successful!");
        console.log("Result:", result);

        // Test table access
        const users = await db.select().from(user).limit(1);
        console.log("✅ Table access works", users);

        // delete all stories
        //const res = await db.execute("TRUNCATE TABLE stories CASCADE;")
        //console.log("Deleted all stories", res)
    } catch (error) {
        console.error("❌ Database connection failed:");
        console.error(error);
    } finally {
        process.exit(0);
    }
}

testConnection();
