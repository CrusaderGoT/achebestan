import { organization } from "@/drizzle/schemas/user";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const organizationInsertSchema = createInsertSchema(organization, {
    slug: z.string().nonempty().nonoptional(),
    logo: z.url().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
}).omit({
    id: true,
    createdAt: true,
});

export type OrganizationInsertSchemaType = z.infer<
    typeof organizationInsertSchema
>;
