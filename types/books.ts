import { getBookStories } from "@/lib/actions/book";

export type BookStoriesType = Awaited<ReturnType<typeof getBookStories>>;
