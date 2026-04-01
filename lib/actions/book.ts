"use server";

import { db } from "@/drizzle";
import { book } from "@/drizzle/schemas/book";
import { bookInsertSchema } from "@/zod-schemas/book";
import { unstable_cache } from "next/cache";
import { authActionClient } from "../safe-action";

export async function getBookStories(
    bookId?: number | null,
    offset: number = 1,
    limit: number = 10
) {
    if (!bookId) return [];

    const fetchStories = unstable_cache(
        async () => {
            try {
                const bookStories = await db.query.story.findMany({
                    where(fields, operators) {
                        return operators.eq(fields.bookId, bookId);
                    },
                    limit,
                    offset: (offset - 1) * limit,
                    orderBy(fields, operators) {
                        return operators.asc(fields.bookPart);
                    },
                    columns: {
                        isbn: true,
                        bookPart: true,
                    },
                });

                return bookStories;
            } catch (error) {
                console.error("Book stories error:", error);
                throw new Error("Failed to get book stories");
            }
        },
        [`book-${bookId}`],
        {
            revalidate: 60 * 10,
            tags: [`book-${bookId}`],
        }
    );

    return fetchStories();
}

export const createBookAction = authActionClient
    .inputSchema(bookInsertSchema)
    .action(async ({ parsedInput, ctx }) => {
        const [newBook] = await db
            .insert(book)
            .values({
                authorId: ctx.user.id,
                name: parsedInput.name,
                created: new Date(),
            })
            .returning();

        return newBook;
    });

export async function getUserBooks(
    userId: string,
    offset: number,
    limit: number = 10
) {
    try {
        const userBooks = await db.query.book.findMany({
            where(fields, operators) {
                return operators.eq(fields.authorId, userId);
            },
            limit: limit,
            offset: (offset - 1) * limit,
            orderBy(fields, operators) {
                return operators.asc(fields.created);
            },
            columns: {
                id: true,
                name: true,
            },
        });

        return userBooks;
    } catch (error) {
        console.error("User books error:", error);
        throw new Error("Failed to get user books");
    }
}
