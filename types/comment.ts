import { getBulkCommentsPermmissions } from "@/lib/actions/comment";
import { authClient } from "@/lib/auth-client";
import { CommentSelectType, CommentUpdateType } from "@/zod-schemas/comment";
import { RatingSelectType } from "@/zod-schemas/rating";
import { ReactionSelectType } from "@/zod-schemas/reaction";
import {
    MantineSize,
    RenderTreeNodePayload,
    TreeNodeData,
    useTree,
} from "@mantine/core";
import { UseStateHistoryHandlers, UseStateHistoryValue } from "@mantine/hooks";
import { UserSelectType } from "./user";

export type CommentTreeProps = CommentSelectType & {
    childComments?: CommentSelectType[] | null;
    rating?: RatingSelectType | null;
    user?: UserSelectType | null;
    reactions?: ReactionSelectType[] | null;
};

export type CommentsToTreeNodeDataType = (TreeNodeData & CommentTreeProps)[]; // Hook for drawer management

export type CommentsPermmissionsMapType = Awaited<
    ReturnType<typeof getBulkCommentsPermmissions>
>;

export interface CommentDrawerState {
    drawerOpened: boolean;
    drawerCommentData: CommentsToTreeNodeDataType;
    drawerCommentMap: Map<string, CommentTreeProps>;
    drawerTree: ReturnType<typeof useTree>;
    handleOpenDrawer: (comment: CommentTreeProps) => void;
    closeDrawer: () => void;
    drawerTitle: string;
    activeDrawerHandlers: UseStateHistoryHandlers<string | null>;
    drawerHistory: UseStateHistoryValue<string | null>;
    activeDrawerCommentId: string | null;
}

// Configuration
export type COMMENT_DRAWER_CONFIG_TYPE = {
    drawerLevel: number;
    drawerSize: MantineSize;
    drawerPosition: "left" | "right" | "bottom";
    indentationSize: number;
    titleMaxLength: number;
};

export type CommentNodeProps = RenderTreeNodePayload;

export interface CommentRenderContext {
    isInDrawer: boolean;
    tree: ReturnType<typeof useTree>;
    commentMap: Map<string, CommentTreeProps>;
    commentsPermissionsMap: CommentsPermmissionsMapType;
    onOpenDrawer: (comment: CommentTreeProps) => void;
    storyAuthorId: string | undefined;
}

export interface CommentInteractionHandlers {
    activeReplyId: number | null;
    activeEditId: number | null;
    handleReplyToggle: (commentId: number) => void;
    handleEditToggle: (commentId: number) => void;
    handleCloseReply: () => void;
    handleCloseEdit: () => void;
    focusTrapRef: React.RefCallback<HTMLElement | null>;
}

export type CommentPartialType =
    | Partial<CommentSelectType>
    | Partial<CommentUpdateType>;

export type CommentPermissionsType = {
    canDeleteOwn: boolean;
    canDeleteAll: boolean;
    canUpdate: boolean;
    canCreate: boolean;
};

export type CommentActionsProps = {
    handleCloseReply: () => void;
    handleReplyToggle: (commentId: number) => void;
    handleCloseEdit: () => void;
    handleEditToggle: (commentId: number) => void;
    isReplyOpen: boolean;
    commentId: number;
    commentUserId: string;
    isPendingUpdateComment: boolean;
    storyISBN: string;
    isEditOpen: boolean;
    session: ReturnType<typeof authClient.useSession>["data"];
    hasBeenDeleted: boolean | null;
    permissions?: CommentPermissionsType;
};

export type FlattenedCommentIdsType = {
    id: number;
    userId: string;
};

export const noCommentPermissions = {
    canDeleteOwn: false,
    canDeleteAll: false,
    canUpdate: false,
    canCreate: false,
};
