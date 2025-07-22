// base schemas used as helpers / not tables themselves
import * as t from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const timestamps = {
    created: t.timestamp().defaultNow().notNull(),
    edited: t.timestamp(),
};

export const image = {
    image: t.varchar(),
    imageAlt: t.varchar(),
};

export const actionMetadatSchema = z.object({
    actionName: z.string(),
    user: z.string(),
});
