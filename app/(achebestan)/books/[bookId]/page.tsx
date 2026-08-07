import { BookPage } from "@/components/book/book-page";
import { getBookAndStories } from "@/lib/actions/book";
import { notFound } from "next/navigation";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function BookStories({
    params,
}: {
    params: Promise<{ bookId: number }>;
}) {
    const { bookId } = await params;

    const book = await getBookAndStories(bookId);

    if (!book) notFound();

    return <BookPage {...book} />;
}
