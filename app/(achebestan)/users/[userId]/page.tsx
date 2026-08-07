import { UserPage } from "@/components/ui/user-page";
import { getUserAndBooksWithStoryCount } from "@/lib/actions/user";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AuthorPage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;

    const userWithBooks = await getUserAndBooksWithStoryCount(userId);

    return <UserPage {...userWithBooks} />;
}
