"use client";

import publicStyles from "@/styles/public.module.css";

import {
    ActionIcon,
    Drawer,
    getTreeExpandedState,
    Group,
    MantineSize,
    Text,
    Tree,
    useTree,
} from "@mantine/core";

import { IconArrowBack } from "@tabler/icons-react";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { authClient } from "@/lib/auth-client";
import { useMounted } from "@mantine/hooks";

import {
    CommentNodeProps,
    CommentRenderContext,
    CommentsToTreeNodeDataType,
    CommentTreeProps,
    DRAWER_CONFIG_TYPE,
} from "@/types/comment";

import {
    buildCommentHierarchy,
    commentsToTreeNodeData,
    CommentTreeUtils,
    flattenComments,
} from "@/lib/utils/helpers";

import {
    useCommentInteractions,
    useDrawerState,
} from "@/lib/hooks/comment/comment-tree-hooks";
import { CommentNode } from "./comment-node";

import commentTreeStyles from "@/styles/comment-tree.module.css";

export const DRAWER_CONFIG: DRAWER_CONFIG_TYPE = {
    drawerLevel: 4,
    drawerSize: "sm" as MantineSize,
    drawerPosition: "bottom" as const,
    indentationSize: 23, // New: Make indentation configurable
    titleMaxLength: 50, // New: Make title truncation configurable
};

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
        const values: string[] = [];

        commentsNodeData
            .slice(0, CommentTreeUtils.initialExpandCount)
            .filter((c) => !c.parentCommentId && !c.hasBeenDeleted)
            .forEach((c) => {
                values.push(c.value);
                if (c.children?.length && c.children.length > 0) {
                    c.children
                        .slice(0, CommentTreeUtils.initialExpandCount)
                        .forEach((ch) => values.push(ch.value));
                }
            });

        return values;
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

    // Enhanced auto-expansion with error handling
    useEffect(() => {
        try {
            newCommentsToExpand.forEach((commentId) => {
                if (
                    commentId &&
                    !autoExpandedRef.current.has(commentId) &&
                    !tree.expandedState[commentId]
                ) {
                    requestAnimationFrame(() => {
                        tree.expand(commentId);
                    });
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
                levelOffset={"xl"}
                expandOnClick={false}
                expandOnSpace={false}
                renderNode={renderMainNode}
                classNames={{
                    root: publicStyles.noTapHighlight,
                    node: commentTreeStyles.parentComment,
                    subtree: commentTreeStyles.childComment,
                }}
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

                        <Text truncate="end" maw={200} c="dimmed" size="xs">
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
                        levelOffset={"xl"}
                        expandOnClick={false}
                        expandOnSpace={false}
                        renderNode={renderDrawerNode}
                        classNames={{
                            root: publicStyles.noTapHighlight,
                            node: commentTreeStyles.parentComment,
                            subtree: commentTreeStyles.childComment,
                        }}
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
