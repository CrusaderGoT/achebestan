import { db } from "@/drizzle";
import { pushSubscriptions } from "@/drizzle/schemas/pwa";
import { auth } from "@/lib/auth/auth";
import { notificationPayloadSchema } from "@/zod-schemas/pwa";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

// Configure web-push
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Only allow authenticated admins to send notifications
        if (!session?.user?.id || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validation = notificationPayloadSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid payload", details: validation.error },
                { status: 400 }
            );
        }

        const payload = validation.data;

        // Get all active subscriptions (or filter by userId if provided)
        const targetUserId = body.userId;
        const query = targetUserId
            ? db
                  .select()
                  .from(pushSubscriptions)
                  .where(eq(pushSubscriptions.userId, targetUserId))
            : db.select().from(pushSubscriptions);

        const subscriptions = await query;

        if (subscriptions.length === 0) {
            return NextResponse.json(
                { message: "No subscriptions found" },
                { status: 200 }
            );
        }

        // Send notifications to all subscriptions
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
                        JSON.stringify(payload)
                    );
                    return { success: true, endpoint: subscription.endpoint };
                } catch (error) {
                    // Handle expired subscriptions
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
                    return {
                        success: false,
                        endpoint: subscription.endpoint,
                        error: error,
                    };
                }
            })
        );

        const successful = results.filter(
            (r) => r.status === "fulfilled"
        ).length;
        const failed = results.filter((r) => r.status === "rejected").length;

        return NextResponse.json({
            message: `Notifications sent: ${successful} successful, ${failed} failed`,
            results,
        });
    } catch (error) {
        console.error("Error sending notifications:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
