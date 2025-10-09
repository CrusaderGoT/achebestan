import { z } from "zod/v4";

export const organizationInsertSchema = z.object({
    name: z
        .string({ error: "The organization name" })
        .min(10, { error: "name must be at least 3 characters" })
        .max(20, { error: "maximum of 20 letters" })
        .regex(/^[A-Za-z]+$/, { error: "name must be only letters" }),
    slug: z
        .string()
        .regex(/^[a-z0-9-]+$/, "Must be alphanumeric and contain hyphens.") // Matches lowercase alphanumeric and hyphens
        .nonempty({ error: "Must not be empty" }) // Ensures the slug is not empty
        .max(50, "Must be 50 characters or less"), // Limits slug length
    logo: z.url().optional(),
    metadata: z.record(z.string(), z.any()),
});

export type OrganizationInsertSchemaType = z.infer<
    typeof organizationInsertSchema
>;
