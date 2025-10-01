"use server";

import { db } from "@/drizzle";
import { pushSubscriptions } from "@/drizzle/schemas/pwa";
import { authActionClient } from "@/lib/safe-action";
import { subscriptionSchema } from "@/zod-schemas/pwa";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const subscribeToPush = authActionClient
    .inputSchema(subscriptionSchema)
    .action(async ({ parsedInput, ctx }) => {
        // Check if subscription already exists
        const [existing] = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.endpoint, parsedInput.endpoint))
            .limit(1);

        if (existing) {
            // Update existing subscription
            await db
                .update(pushSubscriptions)
                .set({
                    keys: parsedInput.keys,
                    updatedAt: new Date(),
                })
                .where(eq(pushSubscriptions.id, existing.id));

            return { success: true, message: "Subscription updated" };
        }

        // Create new subscription
        await db.insert(pushSubscriptions).values({
            userId: ctx.user.id,
            endpoint: parsedInput.endpoint,
            keys: parsedInput.keys,
        });

        revalidatePath("/settings/notifications");
        return {
            success: true,
            message: "Successfully subscribed to notifications",
        };
    });

export const unsubscribeFromPush = authActionClient
    .inputSchema(z.object({ endpoint: z.string().url() }))
    .action(async ({ parsedInput, ctx }) => {
        await db
            .delete(pushSubscriptions)
            .where(
                and(
                    eq(pushSubscriptions.userId, ctx.user.id),
                    eq(pushSubscriptions.endpoint, parsedInput.endpoint)
                )
            );

        revalidatePath("/settings/notifications");
        return {
            success: true,
            message: "Successfully unsubscribed from notifications",
        };
    });

export const getSubscriptionStatus = authActionClient
    .inputSchema(z.object({}))
    .action(async ({ ctx }) => {
        if (!ctx.user.id) {
            return { isSubscribed: false, subscriptionCount: 0 };
        }

        const [subscriptions] = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.userId, ctx.user.id));

        return {
            isSubscribed: !!subscriptions,
            subscriptionCount: subscriptions,
            subscriptions: [subscriptions],
        };
    });
