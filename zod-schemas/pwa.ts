import { z } from "zod/v4";

export const subscriptionSchema = z.object({
    endpoint: z.url(),
    keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
    }),
});

export const notificationPayloadSchema = z.object({
    title: z.string().min(1).max(100),
    body: z.string().min(1).max(500),
    icon: z.url().optional(),
    badge: z.url().optional(),
    tag: z.string().optional(),
    data: z.record(z.any(), z.any()).optional(),
    actions: z
        .array(
            z.object({
                action: z.string(),
                title: z.string(),
                icon: z.url().optional(),
            })
        )
        .optional(),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;
