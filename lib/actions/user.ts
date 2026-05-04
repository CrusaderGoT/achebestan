"use server";

import { db } from "@/drizzle";
import { book } from "@/drizzle/schemas/book";
import { story } from "@/drizzle/schemas/story";
import { user } from "@/drizzle/schemas/user";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export async function getUserAndBooksWithStoryCount(userId: string) {
    try {
        // 🚀 OPTIMIZATION: Run both queries simultaneously
        const [userResult, books] = await Promise.all([
            db.select({ user }).from(user).where(eq(user.id, userId)).limit(1),
            db
                .select({
                    book: book,
                    bookStoriesCount: db.$count(
                        story,
                        eq(story.bookId, book.id),
                    ),
                })
                .from(book)
                .where(eq(book.authorId, userId)),
        ]);

        const baseData = userResult[0];

        if (!baseData) notFound();

        return {
            ...baseData,
            books,
        };
    } catch (e) {
        console.error("Error: getUserAndBooksWithStoryCount", e);
        throw new Error("Failed to get user with their stories");
    }
}

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
        console.log("User books error:", error);
        throw new Error("Failed to get user books");
    }
}
