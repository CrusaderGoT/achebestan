"use server";

import { db } from "@/drizzle";
import { book } from "@/drizzle/schemas/book";
import { bookInsertSchema } from "@/zod-schemas/book";
import { cacheTag, updateTag } from "next/cache";
import { authActionClient } from "../safe-action";

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

        updateTag(`userAndBooks-${ctx.user.id}`);

        return newBook;
    });

export async function getStoriesFromBook(
    bookId: number,
    offset: number = 0,
    limit: number = 10,
) {
    "use cache";
    cacheTag(`bookAndStories-${bookId}`);

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
            console.log("Book stories error:", error);
            throw new Error("Failed to get book stories");
        }
    };

    return fetchStories();
}

export async function getBookAndStories(bookId: number) {
    "use cache";
    cacheTag(`bookAndStories-${bookId}`);

    try {
        const storyBook = await db.query.book.findFirst({
            where(fields, operators) {
                return operators.and(operators.eq(fields.id, bookId));
            },
            with: {
                stories: {
                    columns: {
                        isbn: true,
                        bookPart: true,
                        title: true,
                        subtitle: true,
                        blurb: true,
                        image: true,
                    },
                },
                author: true,
            },
        });

        return storyBook;
    } catch (error) {
        console.log("story's book error:", error);
        throw new Error("Failed to get story's book");
    }
}
