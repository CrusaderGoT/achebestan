// base schemas used as helpers / not tables themselves
import * as t from "drizzle-orm/pg-core";

export const timestamps = {
    created: t.timestamp().defaultNow().notNull(),
    edited: t.timestamp(),
};

export const image = {
    image: t.varchar(),
    imageAlt: t.varchar(),
};
