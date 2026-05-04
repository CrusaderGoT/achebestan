import { UserPage } from "@/components/ui/user-page";
import { getUserAndBooksWithStoryCount } from "@/lib/actions/user";

export default async function AuthorPage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;

    const userWithBooks = await getUserAndBooksWithStoryCount(userId);

    return <UserPage {...userWithBooks} />;
}
