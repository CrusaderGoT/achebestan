import { CommentSelectType } from "@/zod-schemas/comment";
import { RatingSelectType } from "@/zod-schemas/rating";
import { ReactionSelectType } from "@/zod-schemas/reaction";
import { UserSelectType } from "@/zod-schemas/user";
import {
    MantineSize,
    RenderTreeNodePayload,
    TreeNodeData,
    useTree,
} from "@mantine/core";
import { UseStateHistoryHandlers, UseStateHistoryValue } from "@mantine/hooks";

export type CommentTreeProps = CommentSelectType & {
    childComments?: CommentSelectType[] | null;
    rating?: RatingSelectType | null;
    user?: UserSelectType | null;
    reactions?: ReactionSelectType[] | null;
};

export type CommentsToTreeNodeDataType = (TreeNodeData & CommentTreeProps)[]; // Hook for drawer management

export interface DrawerState {
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
export type DRAWER_CONFIG_TYPE = {
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
    onOpenDrawer: (comment: CommentTreeProps) => void;
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
