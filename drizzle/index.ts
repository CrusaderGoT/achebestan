import { drizzle } from 'drizzle-orm/neon-http';

export const db = drizzle(process.env.LOCAL_POSTGRES_URL!);

