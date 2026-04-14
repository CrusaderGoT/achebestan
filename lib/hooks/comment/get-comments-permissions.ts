import {
    getBulkCommentsPermmissions,
    getSingleCommentsPermmissions,
} from "@/lib/actions/comment";
import { FlattenedCommentIdsType } from "@/types/comment";
import { UserSelectType } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

export function useBulkCommentsPermissions({
    comments,
    isbn,
    user,
}: {
    comments: FlattenedCommentIdsType[];
    isbn: string;
    user: UserSelectType | undefined;
}) {
    return useQuery({
        queryKey: ["bulk-comments-permissions", { isbn, userId: user?.id }],
        queryFn: async () => {
            if (comments.length < 1) {
                throw new Error(
                    "Comments to check permissions cannot be empty",
                );
            }

            const data = await getBulkCommentsPermmissions({ comments, user });

            if (!data) {
                throw new Error(
                    "Failed to get permission for this batch of comments",
                );
            }
            return data;
        },
        enabled: comments.length > 0 && !!user,
    });
}

export function useSingleCommentsPermissions({
    comment,
    isbn,
    user,
}: {
    comment: FlattenedCommentIdsType | undefined;
    isbn: string;
    user: UserSelectType | undefined;
}) {
    return useQuery({
        queryKey: [
            "single-comment-permissions",
            { isbn, userId: user?.id, commentId: comment?.id },
        ],
        queryFn: async () => {
            if (!comment) {
                throw new Error(
                    "Comment to check permissions cannot be undefined",
                );
            }

            const data = await getSingleCommentsPermmissions({ comment, user });

            if (!data) {
                throw new Error("Failed to get permission for this comment");
            }

            return { id: comment.id, data };
        },
        enabled: !!comment && !!user,
    });
}
