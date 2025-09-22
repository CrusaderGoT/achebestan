"use client";

import commentTreeStyles from "@/styles/comment-tree.module.css";
import publicStyles from "@/styles/public.module.css";
import cx from "clsx";

import {
    ActionIcon,
    Avatar,
    Box,
    Button,
    Collapse,
    Drawer,
    getTreeExpandedState,
    Group,
    MantineSize,
    Rating,
    RenderTreeNodePayload,
    Stack,
    Text,
    Tree,
    TreeNodeData,
    useTree,
} from "@mantine/core";

import {
    IconArrowBack,
    IconChevronDown,
    IconExternalLink,
    IconUser,
} from "@tabler/icons-react";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { useFocusTrap, useMounted, useStateHistory } from "@mantine/hooks";

import { CreateCommentForm } from "@/components/forms/comment/create-comment-form";

import { useUpdateComment } from "@/lib/hooks/comment/comment-hook";
import dayjs from "dayjs";
import { LikeDislikeButton } from "../buttons/comment/like-dislike-btns";
import { UpdateCommentForm } from "../forms/comment/update-comment-form";

import {
    CommentsToTreeNodeDataType,
    CommentTreeProps,
} from "@/lib/types/comment";

import {
    buildCommentHierarchy,
    commentsToTreeNodeData,
    flattenComments,
} from "@/lib/utils/helpers";

import { CommentActions } from "./comment-actions";
import { CommentHeader } from "./comment-header";

import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Configuration
type DRAWER_CONFIGType = {
    drawerLevel: number;
    initialExpandCount: number;
    drawerSize: MantineSize;
    drawerPosition: "left" | "right" | "bottom";
};
const DRAWER_CONFIG: DRAWER_CONFIGType = {
    drawerLevel: 2, // Level that should show drawer - test
    initialExpandCount: 10,
    drawerSize: "sm",
    drawerPosition: "bottom",
};

// Types
type CommentNodeProps = RenderTreeNodePayload;

interface CommentRenderContext {
    isInDrawer: boolean;
    tree: ReturnType<typeof useTree>;
    commentMap: Map<string, CommentTreeProps>;
    onOpenDrawer: (commentId: string) => void;
}

interface CommentInteractionHandlers {
    activeReplyId: number | null;
    activeEditId: number | null;
    handleReplyToggle: (commentId: number) => void;
    handleEditToggle: (commentId: number) => void;
    handleCloseReply: () => void;
    handleCloseEdit: () => void;
    focusTrapRef: React.RefCallback<HTMLElement | null>;
}

// Utility functions
class CommentTreeUtils {
    static shouldShowDrawerButton(
        level: number,
        hasChildren: boolean
    ): boolean {
        return DRAWER_CONFIG.drawerLevel === level && hasChildren;
    }

    static calculateIndentation(level: number, isInDrawer: boolean): number {
        return isInDrawer ? (level - 1) * 23 : (level - 1) * 23;
    }

    // Fixed version of getCommentWithChildren method
    static getCommentWithChildren(
        commentId: string,
        nodeData: CommentsToTreeNodeDataType
    ): CommentsToTreeNodeDataType {
        const findNodeRecursively = (
            nodes: CommentsToTreeNodeDataType,
            targetId: string
        ): TreeNodeData | null => {
            for (const node of nodes) {
                if (node.value === targetId) {
                    return node;
                }
                if (node.children) {
                    const found = findNodeRecursively(
                        node.children as CommentsToTreeNodeDataType,
                        targetId
                    );
                    if (found) return found;
                }
            }
            return null;
        };

        // First find the node recursively in the entire tree
        const targetNode = findNodeRecursively(nodeData, commentId);

        if (!targetNode) {
            return [];
        }

        // Return just the target node with its existing tree structure intact
        // The tree component will handle rendering the hierarchy correctly
        return [targetNode as CommentsToTreeNodeDataType[0]];
    }
}

// Hook for comment interactions
function useCommentInteractions(): CommentInteractionHandlers {
    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
    const [activeEditId, setActiveEditId] = useState<number | null>(null);
    const focusTrapRef = useFocusTrap();

    const handleReplyToggle = useCallback((commentId: number) => {
        setActiveReplyId((current) =>
            current === commentId ? null : commentId
        );
    }, []);

    const handleEditToggle = useCallback((commentId: number) => {
        setActiveEditId((current) =>
            current === commentId ? null : commentId
        );
    }, []);

    const handleCloseReply = useCallback(() => setActiveReplyId(null), []);
    const handleCloseEdit = useCallback(() => setActiveEditId(null), []);

    return {
        activeReplyId,
        activeEditId,
        handleReplyToggle,
        handleEditToggle,
        handleCloseReply,
        handleCloseEdit,
        focusTrapRef,
    };
}

// Hook for drawer management
function useDrawerState(commentsNodeData: CommentsToTreeNodeDataType) {
    const [drawerOpened, setDrawerOpened] = useState(false);

    const [activeDrawerCommentId, activeDrawerHandlers, drawerHistory] =
        useStateHistory<string | null>(null);

    const drawerTree = useTree({
        multiple: false,
        initialExpandedState: {},
    });

    // Compute drawer data dynamically based on current commentsNodeData
    const { drawerCommentData, drawerCommentMap, drawerTitle } = useMemo(() => {
        if (!activeDrawerCommentId || !drawerOpened) {
            return {
                drawerCommentData: [],
                drawerCommentMap: new Map<string, CommentTreeProps>(),
                drawerTitle: "Comment Thread",
            };
        }

        const commentWithChildren = CommentTreeUtils.getCommentWithChildren(
            activeDrawerCommentId,
            commentsNodeData
        );
        const drawerMap = new Map<string, CommentTreeProps>();
        flattenComments(commentWithChildren, drawerMap);

        // Get the root comment for title
        const rootComment = drawerMap.get(activeDrawerCommentId);

        // Custom title formatting
        let title = "Comment Thread";
        if (rootComment) {
            const author = rootComment.user?.name;
            const text = rootComment.text;

            if (author) {
                title = `Thread by ${author}: "${text}"`;
            } else {
                title = title + " " + `${text}`;
            }
        }

        return {
            drawerCommentData: commentWithChildren,
            drawerCommentMap: drawerMap,
            drawerTitle: title,
        };
    }, [activeDrawerCommentId, drawerOpened, commentsNodeData]);

    const handleOpenDrawer = useCallback(
        (commentId: string) => {
            activeDrawerHandlers.set(commentId);
            setDrawerOpened(true);

            // Auto-expand the root comment in drawer
            setTimeout(() => drawerTree.expand(commentId), 100);
        },
        [drawerTree, activeDrawerHandlers]
    );

    const closeDrawer = useCallback(() => {
        setDrawerOpened(false);
        activeDrawerHandlers.set(null);
    }, [activeDrawerHandlers]);

    return {
        drawerOpened,
        drawerCommentData,
        drawerCommentMap,
        drawerTree,
        handleOpenDrawer,
        closeDrawer,
        drawerTitle,
        activeDrawerHandlers,
        drawerHistory,
        activeDrawerCommentId,
    };
}
// Component for comment content
function CommentContent({
    comment,
    node,
    isEditOpen,
    handleCloseEdit,
}: {
    comment: CommentTreeProps;
    node: TreeNodeData;
    isEditOpen: boolean;
    handleCloseEdit: () => void;
}) {
    if (comment.hasBeenDeleted) {
        return <Text size="sm">Deleted</Text>;
    }

    return (
        <Stack gap={4} flex={1}>
            {comment.rating?.stars && (
                <Rating
                    defaultValue={comment.rating.stars}
                    readOnly
                    fractions={2}
                    size="xs"
                />
            )}

            <Text size="sm">
                {isEditOpen ? (
                    <UpdateCommentForm
                        text={comment.text}
                        commentId={comment.id}
                        storyISBN={comment.storyISBN}
                        userId={comment.userId}
                        closeCommentForm={handleCloseEdit}
                    />
                ) : (
                    node.label
                )}
            </Text>
        </Stack>
    );
}

// Component for comment header
function CommentNodeHeader({
    comment,
    hasChildren,
    expanded,
    level,
    onToggleExpand,
    onOpenDrawer,
}: {
    comment: CommentTreeProps;
    hasChildren: boolean;
    expanded: boolean;
    level: number;
    isInDrawer: boolean;
    onToggleExpand: () => void;
    onOpenDrawer: () => void;
}) {
    const showDrawerButton = CommentTreeUtils.shouldShowDrawerButton(
        level,
        hasChildren
    );

    return (
        <Group
            align="flex-start"
            gap="xs"
            onClick={(e) => {
                if (!showDrawerButton) {
                    onToggleExpand();
                } else {
                    e.stopPropagation();
                    onOpenDrawer();
                }
            }}
        >
            <Avatar size="sm">
                <IconUser />
            </Avatar>

            {!comment.hasBeenDeleted ? (
                <CommentHeader {...comment} />
            ) : (
                <>
                    <Text size="xs" c="dimmed">
                        [deleted]
                    </Text>
                    <Text size="xs" c="dimmed">
                        deleted
                    </Text>
                </>
            )}

            {hasChildren && !showDrawerButton && (
                <IconChevronDown
                    size={18}
                    style={{
                        cursor: "pointer",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                    }}
                />
            )}

            {showDrawerButton && (
                <Button
                    variant="subtle"
                    size="compact-xs"
                    leftSection={<IconExternalLink size={14} />}
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenDrawer();
                    }}
                >
                    View thread
                </Button>
            )}
        </Group>
    );
}

// Main comment node renderer
function CommentNode({
    nodeProps,
    context,
    interactions,
    session,
}: {
    nodeProps: CommentNodeProps;
    context: CommentRenderContext;
    interactions: CommentInteractionHandlers;
    session: ReturnType<typeof authClient.useSession>["data"];
}) {
    const { node, expanded, hasChildren, elementProps, level } = nodeProps;
    const { isInDrawer, tree, commentMap, onOpenDrawer } = context;
    const {
        activeReplyId,
        activeEditId,
        handleReplyToggle,
        handleEditToggle,
        handleCloseEdit,
        handleCloseReply,
        focusTrapRef,
    } = interactions;

    const comment = commentMap.get(node.value);
    const { isPending: isPendingUpdateComment } = useUpdateComment();

    const showDrawerButton = CommentTreeUtils.shouldShowDrawerButton(
        level,
        hasChildren
    );

    useEffect(() => {
        if (expanded && showDrawerButton) {
            tree.collapse(node.value);
        }
    }, [expanded, showDrawerButton, tree, node.value]);

    if (!comment) return null;

    const isReplyOpen = activeReplyId === Number(node.value);
    const isEditOpen = activeEditId === comment.id;

    const likes = comment.reactions?.filter((r) => r.liked).length;
    const dislikes = comment.reactions?.filter((r) => r.disliked).length;
    const userReaction = comment.reactions
        ?.filter((r) => r.userId === session?.user.id)
        .pop();

    const handleToggleExpand = () => {
        tree.toggleExpanded(node.value);
        if (node.children && !showDrawerButton) {
            node.children.forEach((c) => tree.expand(c.value));
        }
    };

    return (
        <Stack
            gap={2}
            p="sm"
            {...elementProps}
            className={cx(level > 1 && commentTreeStyles.childCommentLine)}
            style={{
                marginLeft: `${CommentTreeUtils.calculateIndentation(
                    level,
                    isInDrawer
                )}px`,
            }}
        >
            <CommentNodeHeader
                comment={comment}
                hasChildren={hasChildren}
                expanded={expanded}
                level={level}
                isInDrawer={isInDrawer}
                onToggleExpand={handleToggleExpand}
                onOpenDrawer={() => onOpenDrawer(node.value)}
            />

            {!showDrawerButton && (
                <Collapse in={tree.expandedState[node.value]} keepMounted>
                    <Stack ml={28} gap={2}>
                        <CommentContent
                            comment={comment}
                            node={node}
                            isEditOpen={isEditOpen}
                            handleCloseEdit={handleCloseEdit}
                        />

                        {!comment.hasBeenDeleted && (
                            <LikeDislikeButton
                                commentId={comment.id}
                                likes={likes}
                                dislikes={dislikes}
                                userReaction={userReaction}
                            />
                        )}

                        {!comment.hasBeenDeleted && session?.user.id && (
                            <CommentActions
                                commentId={comment.id}
                                commentUserId={comment.userId}
                                userId={session.user.id}
                                isReplyOpen={isReplyOpen}
                                isPendingUpdateComment={isPendingUpdateComment}
                                isEditOpen={isEditOpen}
                                handleEditToggle={handleEditToggle}
                                handleReplyToggle={handleReplyToggle}
                                handleCloseEdit={handleCloseEdit}
                                handleCloseReply={handleCloseReply}
                                storyISBN={comment.storyISBN}
                            />
                        )}

                        {isReplyOpen && !comment.hasBeenDeleted && (
                            <Box ml={28} mt="xs" ref={focusTrapRef}>
                                <CreateCommentForm
                                    storyISBN={comment.storyISBN}
                                    text=""
                                    parentCommentId={comment.id}
                                    placeholder={`Reply to ${
                                        comment.user?.name || ""
                                    }`}
                                    closeCommentForm={handleCloseReply}
                                    onNewCommentAdded={tree.expand}
                                />
                            </Box>
                        )}
                    </Stack>
                </Collapse>
            )}
        </Stack>
    );
}

// Main CommentTree component
export function CommentTree({ comments }: { comments: CommentTreeProps[] }) {
    const mounted = useMounted();
    const { data: session } = authClient.useSession();
    const interactions = useCommentInteractions();

    // Memoize comment data
    const commentsNodeData = useMemo<CommentsToTreeNodeDataType>(() => {
        const hierarchicalComments = buildCommentHierarchy(comments);
        return commentsToTreeNodeData(hierarchicalComments);
    }, [comments]);

    const commentMap = useMemo<Map<string, CommentTreeProps>>(() => {
        const map = new Map<string, CommentTreeProps>();
        flattenComments(commentsNodeData, map);
        return map;
    }, [commentsNodeData]);

    // Initialize drawer state
    const drawer = useDrawerState(commentsNodeData);

    // Initialize main tree
    const initialCommentsToExpand = useMemo<string[]>(() => {
        return commentsNodeData
            .slice(0, DRAWER_CONFIG.initialExpandCount)
            .filter((c) => !c.parentCommentId)
            .map((c) => c.value);
    }, [commentsNodeData]);

    const tree = useTree({
        multiple: false,
        initialExpandedState: getTreeExpandedState(
            commentsNodeData,
            initialCommentsToExpand
        ),
    });

    // Auto-expansion logic
    const prevCommentsRef = useRef<CommentsToTreeNodeDataType>([]);
    const autoExpandedRef = useRef(new Set());

    const newCommentsToExpand = useMemo(() => {
        const prevCommentIds = new Set(
            prevCommentsRef.current.map((c) => c.id)
        );
        const newComments = commentsNodeData.filter(
            (c) => !prevCommentIds.has(c.id) && !c.parentCommentId
        );
        prevCommentsRef.current = commentsNodeData;
        return newComments.map((c) => c.value);
    }, [commentsNodeData]);

    useEffect(() => {
        newCommentsToExpand.forEach((commentId) => {
            if (
                !autoExpandedRef.current.has(commentId) &&
                !tree.expandedState[commentId]
            ) {
                tree.expand(commentId);
                autoExpandedRef.current.add(commentId);
            }
        });
    }, [newCommentsToExpand, tree]);

    // Render functions
    const renderMainNode = useCallback(
        (props: CommentNodeProps) => {
            if (!mounted) return null;

            const context: CommentRenderContext = {
                isInDrawer: false,
                tree,
                commentMap,
                onOpenDrawer: drawer.handleOpenDrawer,
            };

            return (
                <CommentNode
                    nodeProps={props}
                    context={context}
                    interactions={interactions}
                    session={session}
                />
            );
        },
        [
            mounted,
            tree,
            commentMap,
            drawer.handleOpenDrawer,
            interactions,
            session,
        ]
    );

    const renderDrawerNode = useCallback(
        (props: CommentNodeProps) => {
            if (!mounted) return null;

            const context: CommentRenderContext = {
                isInDrawer: true,
                tree: drawer.drawerTree,
                commentMap: drawer.drawerCommentMap,
                onOpenDrawer: drawer.handleOpenDrawer,
            };

            return (
                <CommentNode
                    nodeProps={props}
                    context={context}
                    interactions={interactions}
                    session={session}
                />
            );
        },
        [
            mounted,
            drawer.drawerTree,
            drawer.drawerCommentMap,
            drawer.handleOpenDrawer,
            interactions,
            session,
        ]
    );

    return (
        <>
            <Tree
                data={commentsNodeData}
                tree={tree}
                levelOffset={0}
                expandOnClick={false}
                expandOnSpace={false}
                className={publicStyles.noTapHighlight}
                renderNode={renderMainNode}
            />

            <Drawer
                opened={drawer.drawerOpened}
                onClose={drawer.closeDrawer}
                title={
                    <Group>
                        {drawer.drawerHistory.current > 1 &&
                            !!drawer.activeDrawerCommentId && (
                                <ActionIcon
                                    onClick={() => {
                                              drawer.activeDrawerHandlers.back();
                                                               setTimeout(() => drawer.drawerTree.expand(drawer.activeDrawerCommentId as string), 100);    
                                        
                                    }}
                                    variant="subtle"
                                    color="gray"
                                >
                                    <IconArrowBack size={14} />
                                </ActionIcon>
                            )}

                        <Text truncate="end" maw={200}>
                            {drawer.drawerTitle}
                        </Text>
                    </Group>
                }
                size={DRAWER_CONFIG.drawerSize}
                position={DRAWER_CONFIG.drawerPosition}
            >
                {drawer.drawerCommentData.length > 0 && (
                    <Tree
                        data={drawer.drawerCommentData}
                        tree={drawer.drawerTree}
                        levelOffset={0}
                        expandOnClick={false}
                        expandOnSpace={false}
                        className={publicStyles.noTapHighlight}
                        renderNode={renderDrawerNode}
                    />
                )}
            </Drawer>
        </>
    );
}
