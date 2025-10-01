import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./user";

const keys = {
    p256dh: text().notNull(),
    auth: text().notNull(),
};


export const pushSubscriptions = pgTable("push_subscriptions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, {
            onDelete: "cascade",
        }),
    endpoint: text("endpoint").notNull().unique(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    ...keys,
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;

