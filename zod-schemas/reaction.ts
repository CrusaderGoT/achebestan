import { reaction } from "@/drizzle/schemas/reaction";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Story reaction Schemas and Types

export const reactionSelectSchema = createSelectSchema(reaction);

export type ReactionSelectType = z.infer<typeof reactionSelectSchema>;

export const reactionInsertSchema = createInsertSchema(reaction);

export type ReactionInsertType = z.infer<typeof reactionInsertSchema>;
