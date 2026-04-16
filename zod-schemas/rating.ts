import { rating } from "@/drizzle/schemas/rating";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { CommentSelectType } from "./comment";

// Story Rating Schemas and Types

export const ratingSelectSchema = createSelectSchema(rating, {
    id: z.union([z.number(), z.string()]),
});

export type RatingSelectType = z.infer<typeof ratingSelectSchema>;

export interface UserRatingWithComment extends RatingSelectType {
    comment?: CommentSelectType | null;
}
