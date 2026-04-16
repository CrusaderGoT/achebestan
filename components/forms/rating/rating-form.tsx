"use client";

import {
    RatingFields,
    RatingFormProvider,
    useRatingForm,
} from "@/components/forms/rating/rating-form-context";
import {
    useCreateComment,
    useDeleteComment,
    useUpdateComment,
} from "@/lib/hooks/comment/comment-action-hooks";
import { useDeleteRating } from "@/lib/hooks/rating/delete-rating-hook";
import { useRateStory } from "@/lib/hooks/rating/rate-story-hook";
import publicStyles from "@/styles/public.module.css";
import ratingStyles from "@/styles/rating.module.css";
import {
    ratingSelectSchema,
    RatingSelectType,
    UserRatingWithComment,
} from "@/zod-schemas/rating";
import {
    ActionIcon,
    Affix,
    AffixProps,
    CloseButton,
    Group,
    Stack,
    Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconTrashFilled } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import cx from "clsx";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useState } from "react";

type RatingFormProps = {
    storyISBN: string;
    userId: string;
    closeRatingForm: () => void;
    userRating?: UserRatingWithComment;
} & Partial<AffixProps>;

export function RatingForm({
    closeRatingForm,
    userRating,
    storyISBN,
    userId,
    ...props
}: RatingFormProps) {
    const [comment, setComment] = useState(userRating?.comment?.text || "");
    const queryClient = useQueryClient();

    const form = useRatingForm({
        initialValues: {
            storyISBN: storyISBN,
            stars: userRating?.stars || 0,
            id: userRating?.id || "new",
            userId: userId,
        },
        mode: "uncontrolled",
        validate: zod4Resolver(ratingSelectSchema),
    });

    const { executeAsync: executeAsyncRateStory } = useRateStory();
    const {
        executeAsync: executeAsyncDeleteRating,
        isPending: isPendingDeleteRating,
    } = useDeleteRating();
    const { executeAsync: executeAsyncCreateComment } = useCreateComment();
    const { executeAsync: executeAsyncUpdateComment } = useUpdateComment();
    const { executeAsync: executeAsyncDeleteComment } = useDeleteComment();

    const commentChanged =
        (comment?.trim() || "") !== (userRating?.comment?.text?.trim() || "");

    async function saveComment({
        trimmedComment,
        existingCommentId,
        ratingId,
        storyISBN,
        userId,
    }: {
        trimmedComment: string | undefined;
        existingCommentId?: number;
        ratingId: number;
        storyISBN: string;
        userId: string;
    }) {
        if (trimmedComment) {
            if (existingCommentId) {
                // Update existing comment
                await executeAsyncUpdateComment({
                    text: trimmedComment,
                    storyISBN,
                    userId,
                    commentId: existingCommentId,
                });
            } else {
                // Create new comment
                const { data: newComment } = await executeAsyncCreateComment({
                    storyISBN,
                    ratingId,
                    text: trimmedComment,
                    userId,
                });

                if (newComment) {
                    queryClient.invalidateQueries({
                        queryKey: [
                            "single-comment-permissions",
                            {
                                isbn: storyISBN,
                                userId,
                                commentId: newComment.id,
                            },
                        ],
                    });
                }
            }
        } else if (existingCommentId) {
            // Delete comment if text was cleared
            await executeAsyncDeleteComment({
                commentId: existingCommentId,
                userId,
                storyISBN,
            });
        }
    }

    async function handleSubmit(values: RatingSelectType) {
        const trimmedComment = comment?.trim();
        const existingCommentId = userRating?.comment?.id;

        // ✅ REQUIREMENT: Check if stars are selected before allowing a comment
        if (values.stars === 0) {
            notifications.show({
                title: "Rating Required",
                message: "You must select a star rating to leave a comment.",
                color: "orange",
            });
            return;
        }

        // 1. Save/Update Rating first
        const { data: freshRating } = await executeAsyncRateStory({
            ...values,
            id: userRating?.id || "new",
            userId: userId,
        });

        // Fail-safe: if the rating action failed, don't proceed to comment
        if (!freshRating) return;

        // 2. Handle Comment Logic if it changed
        if (commentChanged) {
            await saveComment({
                trimmedComment,
                existingCommentId,
                ratingId: freshRating.id,
                storyISBN,
                userId,
            });
        }

        form.resetDirty();
        closeRatingForm();
    }

    return (
        <Affix {...props}>
            <RatingFormProvider form={form}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap={5} className={ratingStyles.ratingStack}>
                        <CloseButton
                            onClick={closeRatingForm}
                            ml={"auto"}
                            size={"xs"}
                        />

                        <Textarea
                            placeholder="What Did You Think Of The Story?"
                            value={comment}
                            onChange={(event) =>
                                setComment(event.currentTarget.value)
                            }
                            minRows={2}
                            maxRows={4}
                        />

                        <Group gap={"xl"} justify="space-between">
                            <RatingFields fractions={2} />

                            <Group>
                                <ActionIcon
                                    size={"xs"}
                                    color="green"
                                    type="submit"
                                    title="Submit your rating"
                                    variant="light"
                                    loading={form.submitting}
                                    disabled={isPendingDeleteRating}
                                    className={cx(
                                        form.isDirty() || commentChanged
                                            ? publicStyles.show
                                            : publicStyles.hide,
                                    )}
                                >
                                    <IconCheck />
                                </ActionIcon>

                                {userRating?.id &&
                                    typeof userRating.id === "number" && (
                                        <ActionIcon
                                            size={"xs"}
                                            color="red"
                                            title="Delete your rating"
                                            variant="light"
                                            loading={isPendingDeleteRating}
                                            disabled={form.submitting}
                                            onClick={async () => {
                                                const deletedRate =
                                                    await executeAsyncDeleteRating(
                                                        {
                                                            storyISBN,
                                                            userId,
                                                        },
                                                    );

                                                if (deletedRate) {
                                                    setComment("");
                                                    form.setFieldValue(
                                                        "stars",
                                                        0,
                                                    );
                                                    form.resetDirty();
                                                    closeRatingForm();
                                                }
                                            }}
                                        >
                                            <IconTrashFilled />
                                        </ActionIcon>
                                    )}
                            </Group>
                        </Group>
                    </Stack>
                </form>
            </RatingFormProvider>
        </Affix>
    );
}
