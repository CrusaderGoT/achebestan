import { getCommentsPermmissions } from "@/lib/actions/comment";
import { FlattenedCommentIdsType } from "@/types/comment";
import { UserSelectType } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

export function useGetCommentsPermissions({
    comments,
    isbn,
    user,
}: {
    comments: FlattenedCommentIdsType[];
    isbn: string;
    user: UserSelectType | undefined;
}) {
    return useQuery({
        queryKey: ["comments-permissions", { isbn, userId: user?.id }],
        queryFn: async () => {
            if (comments.length < 1) {
                throw new Error(
                    "Comments to check permissions cannot be empty",
                );
            }

            const data = await getCommentsPermmissions({ comments, user });

            if (!data) {
                throw new Error(
                    "Failed to get permission for this batch of comments",
                );
            }
            return data;
        },
        staleTime: 1000 * 60 * 60 * 30,
        refetchInterval: 1000 * 60 * 60 * 15,
        enabled: comments.length > 0 && !!user,
    });
}
