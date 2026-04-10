"use server";

import { db } from "@/drizzle";
import { book } from "@/drizzle/schemas/book";
import { bookInsertSchema } from "@/zod-schemas/book";
import { authActionClient } from "../safe-action";

export async function getBookStories(
    bookId: number,
    offset: number = 0,
    limit: number = 10,
) {
    const fetchStories = async () => {
        try {
            const bookStories = await db.query.story.findMany({
                where(fields, operators) {
                    return operators.eq(fields.bookId, bookId);
                },
                limit: limit,
                offset: offset,
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
    };

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
            .returning({
                authorId: book.authorId,
                name: book.name,
                id: book.id,
            });

        return newBook;
    });

export async function getUserBooks({
    userId,
    offset,
    limit,
}: {
    userId: string;
    offset: number;
    limit: number;
}) {
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

export async function getStoryBook(bookId: number) {
    try {
        const storyBook = await db.query.book.findFirst({
            where(fields, operators) {
                return operators.and(operators.eq(fields.id, bookId));
            },
            columns: {
                id: true,
                name: true,
                created: true,
                edited: true,
            },
        });

        return storyBook;
    } catch (error) {
        console.error("story's book error:", error);
        throw new Error("Failed to get story's book");
    }
}
