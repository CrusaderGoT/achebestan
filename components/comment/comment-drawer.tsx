import commentTreeStyles from "@/styles/comment-tree.module.css";
import publicStyles from "@/styles/public.module.css";
import {
    CommentDrawerProps,
    CommentNodeProps,
    CommentRenderContext,
} from "@/types/comment";
import { ActionIcon, Drawer, Group, Text, Tree } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { IconArrowBack } from "@tabler/icons-react";
import { useCallback } from "react";
import { CommentNode } from "./comment-node";
import { DRAWER_CONFIG } from "./comment-tree";

export function CommentDrawer({
    drawer,
    interactions,
    storyAuthorId,
    commentsPermissionsMap,
    sessionUser,
    onNewComment,
}: CommentDrawerProps) {
    // Initialize drawer state
    const mounted = useMounted();

    const renderDrawerNode = useCallback(
        (props: CommentNodeProps) => {
            if (!mounted) return null;

            const context: CommentRenderContext = {
                isInDrawer: true,
                tree: drawer.drawerTree,
                commentMap: drawer.drawerCommentMap,
                onOpenDrawer: drawer.handleOpenDrawer,
                commentsPermissionsMap: commentsPermissionsMap,
                storyAuthorId: storyAuthorId,
            };

            return (
                <CommentNode
                    nodeProps={props}
                    context={context}
                    interactions={interactions}
                    sessionUser={sessionUser}
                    onNewComment={onNewComment}
                />
            );
        },
        [
            mounted,
            drawer.drawerTree,
            drawer.drawerCommentMap,
            commentsPermissionsMap,
            drawer.handleOpenDrawer,
            interactions,
            sessionUser,
            storyAuthorId,
        ],
    );

    return (
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
                                            drawer.drawerHistory.history.length
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
                                                    previousCommentId,
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
    );
}
