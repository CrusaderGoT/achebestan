import { db } from "@/drizzle";
import { pushSubscriptions } from "@/drizzle/schemas/pwa";
import { NotificationPayload } from "@/zod-schemas/pwa";
import { eq } from "drizzle-orm";
import webpush from "web-push";

// Configure web-push
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function sendNotificationToAllSubscribers(
    notification: NotificationPayload
) {
    const subscriptions = await db.select().from(pushSubscriptions);

    const results = await Promise.allSettled(
        subscriptions.map(async (subscription) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: subscription.endpoint,
                        keys: {
                            auth: subscription.auth,
                            p256dh: subscription.p256dh,
                        },
                    },
                    JSON.stringify(notification)
                );
                return { success: true };
            } catch (error) {
                // Clean up expired subscriptions
                if (error) {
                    await db
                        .delete(pushSubscriptions)
                        .where(
                            eq(
                                pushSubscriptions.endpoint,
                                subscription.endpoint
                            )
                        );
                }
                throw error;
            }
        })
    );

    return results;
}

export async function sendNotificationToUser(
    userId: string,
    notification: NotificationPayload
) {
    const subscriptions = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId));

    if (subscriptions.length === 0) {
        return { sent: 0, message: "No subscriptions found for user" };
    }

    const results = await Promise.allSettled(
        subscriptions.map(async (subscription) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: subscription.endpoint,
                        keys: {
                            auth: subscription.auth,
                            p256dh: subscription.p256dh,
                        },
                    },
                    JSON.stringify(notification)
                );
                return { success: true };
            } catch (error) {
                if (error) {
                    await db
                        .delete(pushSubscriptions)
                        .where(
                            eq(
                                pushSubscriptions.endpoint,
                                subscription.endpoint
                            )
                        );
                }
                throw error;
            }
        })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    return { sent: successful, total: subscriptions.length };
}
