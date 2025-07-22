// drizzle/index.ts

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { WebSocket } from "ws";

const connectionString =
    process.env.NODE_ENV === "production"
        ? process.env.POSTGRES_URL
        : process.env.LOCAL_POSTGRES_URL;

if (!connectionString) {
    throw new Error(
        `Connection string to ${
            process.env.NODE_ENV === "production" ? "Neon" : "local"
        } Postgres not found.`
    );
}

if (process.env.NODE_ENV === "production") {
    neonConfig.webSocketConstructor = WebSocket;
    neonConfig.poolQueryViaFetch = true;
} else {
    neonConfig.wsProxy = (host) => `${host}:5432/v1`;
    neonConfig.useSecureWebSocket = false;
    neonConfig.pipelineTLS = false;
    neonConfig.pipelineConnect = false;
}

const pool = new Pool({ connectionString });

export const db = drizzle(pool, {
    casing: "snake_case",
});
