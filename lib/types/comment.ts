import { CommentSelectType } from "@/zod-schemas/comment";
import { RatingSelectType } from "@/zod-schemas/rating";
import { ReactionSelectType } from "@/zod-schemas/reaction";
import { userSelectType } from "@/zod-schemas/user";
import { TreeNodeData } from "@mantine/core";

export type CommentTreeProps = CommentSelectType & {
    childComments?: CommentSelectType[] | null;
    rating?: RatingSelectType | null;
    user?: userSelectType | null;
    reactions?: ReactionSelectType[] | null;
};

export type CommentsToTreeNodeDataType = (TreeNodeData & CommentTreeProps)[];
