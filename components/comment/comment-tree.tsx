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
import {
    useFocusTrap,
    useMounted,
    useStateHistory,
    UseStateHistoryHandlers,
    UseStateHistoryValue,
} from "@mantine/hooks";

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
type DRAWER_CONFIG_TYPE = {
    drawerLevel: number;
    initialExpandCount: number;
    drawerSize: MantineSize;
    drawerPosition: "left" | "right" | "bottom";
    indentationSize: number;
    titleMaxLength: number;
};

const DRAWER_CONFIG: DRAWER_CONFIG_TYPE = {
    drawerLevel: 2,
    initialExpandCount: 10,
    drawerSize: "sm" as MantineSize,
    drawerPosition: "bottom" as const,
    indentationSize: 23, // New: Make indentation configurable
    titleMaxLength: 50, // New: Make title truncation configurable
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
        // IMPROVEMENT: Make indentation configurable
        const INDENTATION_SIZE = 23;
        return isInDrawer
            ? (level - 1) * INDENTATION_SIZE
            : (level - 1) * INDENTATION_SIZE;
    }

    // IMPROVEMENT: Add validation and better error handling
    static getCommentWithChildren(
        commentId: string,
        nodeData: CommentsToTreeNodeDataType
    ): CommentsToTreeNodeDataType {
        if (!commentId || !nodeData || nodeData.length === 0) {
            return [];
        }

        const findNodeRecursively = (
            nodes: CommentsToTreeNodeDataType,
            targetId: string
        ): TreeNodeData | null => {
            for (const node of nodes) {
                if (node.value === targetId) {
                    return node;
                }
                if (node.children && Array.isArray(node.children)) {
                    const found = findNodeRecursively(
                        node.children as CommentsToTreeNodeDataType,
                        targetId
                    );
                    if (found) return found;
                }
            }
            return null;
        };

        try {
            const targetNode = findNodeRecursively(nodeData, commentId);
            return targetNode
                ? [targetNode as CommentsToTreeNodeDataType[0]]
                : [];
        } catch (error) {
            console.error("Error finding comment node:", error);
            return [];
        }
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
interface DrawerState {
    drawerOpened: boolean;
    drawerCommentData: CommentsToTreeNodeDataType;
    drawerCommentMap: Map<string, CommentTreeProps>;
    drawerTree: ReturnType<typeof useTree>;
    handleOpenDrawer: (commentId: string) => void;
    closeDrawer: () => void;
    drawerTitle: string;
    activeDrawerHandlers: UseStateHistoryHandlers<string | null>;
    drawerHistory: UseStateHistoryValue<string | null>;
    activeDrawerCommentId: string | null;
}

function useDrawerState(
    commentsNodeData: CommentsToTreeNodeDataType
): DrawerState {
    const [drawerOpened, setDrawerOpened] = useState(false);

    const [activeDrawerCommentId, activeDrawerHandlers, drawerHistory] =
        useStateHistory<string | null>(null);

    const drawerTree = useTree({
        multiple: false,
        initialExpandedState: {},
    });

    // IMPROVEMENT: Add error handling and validation
    const { drawerCommentData, drawerCommentMap, drawerTitle } = useMemo(() => {
        if (!activeDrawerCommentId || !drawerOpened) {
            return {
                drawerCommentData: [],
                drawerCommentMap: new Map<string, CommentTreeProps>(),
                drawerTitle: "Comment Thread",
            };
        }

        try {
            const commentWithChildren = CommentTreeUtils.getCommentWithChildren(
                activeDrawerCommentId,
                commentsNodeData
            );

            if (!commentWithChildren || commentWithChildren.length === 0) {
                console.warn(
                    `Comment with ID ${activeDrawerCommentId} not found`
                );
                return {
                    drawerCommentData: [],
                    drawerCommentMap: new Map<string, CommentTreeProps>(),
                    drawerTitle: "Comment Not Found",
                };
            }

            const drawerMap = new Map<string, CommentTreeProps>();
            flattenComments(commentWithChildren, drawerMap);

            // Get the root comment for title
            const rootComment = drawerMap.get(activeDrawerCommentId);

            // IMPROVEMENT: Better title formatting with truncation and escaping
            const getDrawerTitle = (
                comment: CommentTreeProps | undefined
            ): string => {
                if (!comment) return "Comment Thread";

                const author = comment.user?.name;
                const maxTextLength = 50;
                const text =
                    comment.text?.slice(0, maxTextLength) +
                    (comment.text && comment.text.length > maxTextLength
                        ? "..."
                        : "");

                // Escape quotes in text to prevent display issues
                const escapedText = text?.replace(/"/g, '\\"') || "";

                return author
                    ? `Thread by ${author}: "${escapedText}"`
                    : `Comment Thread: ${escapedText}`;
            };

            return {
                drawerCommentData: commentWithChildren,
                drawerCommentMap: drawerMap,
                drawerTitle: getDrawerTitle(rootComment),
            };
        } catch (error) {
            console.error("Error loading comment thread:", error);
            return {
                drawerCommentData: [],
                drawerCommentMap: new Map<string, CommentTreeProps>(),
                drawerTitle: "Error Loading Thread",
            };
        }
    }, [activeDrawerCommentId, drawerOpened, commentsNodeData]);

    // CRITICAL BUG FIX: Completely rewrite handleOpenDrawer
    const handleOpenDrawer = useCallback(
        (commentId: string) => {
            // Set the active comment ID first
            activeDrawerHandlers.set(commentId);

            // Then open the drawer
            setDrawerOpened(true);

            // IMPROVEMENT: Use requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                drawerTree.expand(commentId);
            });
        },
        [drawerTree, activeDrawerHandlers]
    );

    const closeDrawer = useCallback(() => {
        setDrawerOpened(false);
        // IMPROVEMENT: Only reset if drawer was actually open
        if (activeDrawerCommentId) {
            activeDrawerHandlers.reset();
        }
    }, [activeDrawerHandlers, activeDrawerCommentId]);

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

    // IMPROVEMENT: Enhanced auto-expansion with error handling
    useEffect(() => {
        try {
            newCommentsToExpand.forEach((commentId) => {
                if (
                    commentId &&
                    !autoExpandedRef.current.has(commentId) &&
                    !tree.expandedState[commentId]
                ) {
                    tree.expand(commentId);
                    autoExpandedRef.current.add(commentId);
                }
            });
        } catch (error) {
            console.error("Error auto-expanding comments:", error);
        }
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
                        {/**
                         * check drawer is not in it first element (nothing to go back to)
                         * check drawer has something to go back to (prev is not null)
                         */}
                        {drawer.drawerHistory.current > 0 &&
                            drawer.drawerHistory.history[
                                drawer.drawerHistory.current - 1
                            ] && (
                                <ActionIcon
                                    onClick={() => {
                                        const previousIndex =
                                            drawer.drawerHistory.current - 1;

                                        // IMPROVEMENT: Add bounds checking
                                        if (
                                            previousIndex >= 0 &&
                                            previousIndex <
                                                drawer.drawerHistory.history
                                                    .length
                                        ) {
                                            const previousCommentId =
                                                drawer.drawerHistory.history[
                                                    previousIndex
                                                ];

                                            if (previousCommentId) {
                                                drawer.activeDrawerHandlers.back();
                                                // IMPROVEMENT: Add delay to ensure state update
                                                setTimeout(() => {
                                                    drawer.drawerTree.expand(
                                                        previousCommentId
                                                    );
                                                }, 50);
                                            }
                                        }
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
                {/* IMPROVEMENT: Add loading state */}
                {drawer.drawerCommentData.length > 0 ? (
                    <Tree
                        data={drawer.drawerCommentData}
                        tree={drawer.drawerTree}
                        levelOffset={0}
                        expandOnClick={false}
                        expandOnSpace={false}
                        className={publicStyles.noTapHighlight}
                        renderNode={renderDrawerNode}
                    />
                ) : (
                    <Text size="sm" c="dimmed" ta="center" py="xl">
                        {drawer.drawerOpened && !drawer.activeDrawerCommentId
                            ? "Loading comment thread..."
                            : "No comments to display"}
                    </Text>
                )}
            </Drawer>
        </>
    );
}
