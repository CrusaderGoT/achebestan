"use client";

import commentTreeStyles from "@/styles/comment-tree.module.css";
import publicStyles from "@/styles/public.module.css";

import {
    Center,
    Divider,
    getTreeExpandedState,
    MantineSize,
    Text,
    Tree,
    useTree,
} from "@mantine/core";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useMounted } from "@mantine/hooks";

import {
    COMMENT_DRAWER_CONFIG_TYPE,
    CommentNodeProps,
    CommentRenderContext,
    CommentsToTreeNodeDataType,
    CommentTreeProps,
    FlattenedCommentIdsType,
    noCommentPermissions,
} from "@/types/comment";

import {
    buildCommentHierarchy,
    commentsToTreeNodeData,
    CommentTreeUtils,
    flattenComments,
} from "@/lib/utils/comment/comments-tree-utils";

import {
    useCommentInteractions,
    useDrawerState,
} from "@/lib/hooks/comment/comment-tree-hooks";
import { CommentNode } from "./comment-node";

import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import {
    useBulkCommentsPermissions,
    useSingleCommentsPermissions,
} from "@/lib/hooks/comment/get-comments-permissions";
import { flattenCommentsIds } from "@/lib/utils/comment/flatten-comments-ids";

import { UserSelectType } from "@/types/user";
import { CommentSelectType } from "@/zod-schemas/comment";
import { NewCommentBox, NewCommentBoxProps } from "../story/story-actions";
import { CommentDrawer } from "./comment-drawer";

export const DRAWER_CONFIG: COMMENT_DRAWER_CONFIG_TYPE = {
    drawerLevel: 4,
    drawerSize: "sm" as MantineSize,
    drawerPosition: "bottom" as const,
    indentationSize: 23, // New: Make indentation configurable
    titleMaxLength: 50, // New: Make title truncation configurable
};

// Main CommentTree component
function CommentTree({
    comments,
    storyAuthorId,
    storyISBN,
    commentBoxDisclosure,
    canComment,
}: {
    comments: CommentTreeProps[];
    storyAuthorId: string | undefined;
} & NewCommentBoxProps) {
    const mounted = useMounted();
    const { sessionUser } = useCentralizedAuth();
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

    // Flatten all comments (including nested childComments) for permission calculation
    const commentIdsMap = useMemo(() => {
        return flattenCommentsIds(comments);
    }, [commentMap.keys()]);

    const initialDataForCommentsPermissions = new Map([
        [0, noCommentPermissions],
    ]); // default init data, so map is never undefined

    const { data: commentsPermissionsMap = initialDataForCommentsPermissions } =
        useBulkCommentsPermissions({
            comments: commentIdsMap,
            user: sessionUser.data?.user as UserSelectType | undefined,
            isbn: storyISBN,
        });

    // Initialize main tree
    const initialCommentsToExpand = useMemo<string[]>(() => {
        const values: string[] = [];

        // Helper function to recursively add comment and all its descendants
        const addCommentAndDescendants = (
            comment: CommentsToTreeNodeDataType[number],
        ) => {
            values.push(comment.value);

            if (comment.children?.length && comment.children.length > 0) {
                comment.children.forEach((child) => {
                    addCommentAndDescendants(
                        child as CommentsToTreeNodeDataType[number],
                    );
                });
            }
        };

        // Get top-level comments (no parent) that haven't been deleted
        commentsNodeData
            .filter((c) => !c.parentCommentId && !c.hasBeenDeleted)
            .slice(0, CommentTreeUtils.initialExpandCount)
            .forEach((comment) => {
                addCommentAndDescendants(comment);
            });

        return values;
    }, [commentsNodeData]);

    const tree = useTree({
        multiple: false,
        initialExpandedState: getTreeExpandedState(
            commentsNodeData,
            initialCommentsToExpand,
        ),
    });

    const [newComment, setNewComment] = useState<
        FlattenedCommentIdsType | undefined
    >();

    const { data: newCommentPermissions } = useSingleCommentsPermissions({
        comment: newComment,
        user: sessionUser.data?.user as UserSelectType | undefined,
        isbn: storyISBN,
    });

    const onNewComment = useCallback(
        async (newComment: CommentSelectType) => {
            setNewComment(newComment);
            tree.expand(newComment.id.toString());
        },
        [sessionUser.data?.user, newComment],
    );

    useEffect(() => {
        if (!newCommentPermissions) return;

        commentsPermissionsMap.set(
            newCommentPermissions.id,
            newCommentPermissions.data,
        );
    }, [newCommentPermissions]);

    const drawer = useDrawerState(commentsNodeData);

    // Render functions
    const renderMainNode = useCallback(
        (props: CommentNodeProps) => {
            if (!mounted) return null;

            const context: CommentRenderContext = {
                isInDrawer: false,
                tree,
                commentMap,
                commentsPermissionsMap,
                onOpenDrawer: drawer.handleOpenDrawer,
                storyAuthorId: storyAuthorId,
            };

            return (
                <CommentNode
                    nodeProps={props}
                    context={context}
                    interactions={interactions}
                    sessionUser={
                        sessionUser.data?.user as UserSelectType | undefined
                    }
                    onNewComment={onNewComment}
                />
            );
        },
        [
            mounted,
            tree,
            commentMap,
            commentsPermissionsMap,
            drawer.handleOpenDrawer,
            interactions,
            sessionUser.data,
            storyAuthorId,
        ],
    );

    return (
        <>
            <NewCommentBox
                commentBoxDisclosure={commentBoxDisclosure}
                storyISBN={storyISBN}
                canComment={canComment}
                onNewComment={onNewComment}
            />

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

            <CommentDrawer
                drawer={drawer}
                interactions={interactions}
                commentsPermissionsMap={commentsPermissionsMap}
                sessionUser={
                    sessionUser.data?.user as UserSelectType | undefined
                }
                onNewComment={onNewComment}
                storyAuthorId={storyAuthorId}
            />
        </>
    );
}

export function CommentSection({
    comments,
    storyAuthorId,
    storyISBN,
    commentBoxDisclosure,
    canComment,
}: {
    comments?: CommentTreeProps[];
    storyAuthorId?: string;
} & NewCommentBoxProps) {
    if (!comments || comments.length < 1) {
        return (
            <Center>
                <Text c={"dimmed"}>No Comments Yet...</Text>
            </Center>
        );
    }

    return (
        <>
            <Divider
                label={comments && comments.length > 0 ? "comments" : ""}
            />

            <CommentTree
                comments={comments}
                storyAuthorId={storyAuthorId}
                storyISBN={storyISBN}
                commentBoxDisclosure={commentBoxDisclosure}
                canComment={canComment}
            />
        </>
    );
}
