import { BookPage } from "@/components/book/book-page";
import { getBookAndStories } from "@/lib/actions/book";

export default async function BookStories({
    params,
}: {
    params: Promise<{ bookId: number }>;
}) {
    const { bookId } = await params;

    const book = await getBookAndStories(bookId);

    return <BookPage {...book} />;
}
