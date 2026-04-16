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
    const [comment, setComment] = useState(userRating?.comment?.text);

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

    async function saveRating(
        data: RatingSelectType,
        currentRatingId?: number,
    ): Promise<UserRatingWithComment | undefined> {
        const { data: rated } = await executeAsyncRateStory({
            id: currentRatingId || "new",
            stars: data.stars,
            storyISBN: data.storyISBN,
            userId: userId,
        });

        if (!rated) {
            notifications.show({
                message: "An Error Occurred While Adding Your Comment",
                color: "red",
            });
            return undefined; // return the undefined if no rating
        }

        // ✅ Preserve existing comment when updating rating
        const ratedWithComment = {
            ...rated,
            comment: userRating?.comment,
        };

        form.resetDirty();

        return ratedWithComment; // ✅ Return merged data
    }

    async function saveComment({
        trimmedComment,
        existingCommentId,
        ratingId,
        storyISBN,
        userId,
    }: {
        trimmedComment: string | undefined;
        existingCommentId?: number;
        ratingId?: number;
        storyISBN: string;
        userId: string;
    }) {
        const commentInState = !!trimmedComment;

        // Case A: User typed something → Create or Update
        if (commentInState) {
            if (existingCommentId) {
                // Update
                const { data: updatedComment } =
                    await executeAsyncUpdateComment({
                        text: trimmedComment!,
                        storyISBN,
                        userId,
                        commentId: existingCommentId,
                    });

                if (!updatedComment) {
                    notifications.show({
                        message:
                            "An Error Occurred While Updating Your Comment",
                        color: "red",
                    });
                }
            } else {
                // Create
                if (!ratingId || typeof ratingId !== "number") {
                    notifications.show({
                        message:
                            "You Must Rate The Story, To Make A Comment Here",
                    });
                } else {
                    const { data: newComment } =
                        await executeAsyncCreateComment({
                            storyISBN,
                            ratingId,
                            text: trimmedComment!,
                            userId,
                        });

                    if (!newComment) {
                        notifications.show({
                            message:
                                "An Error Occurred While Adding Your Comment",
                            color: "red",
                        });
                    }
                }
            }
        }
        // Case B: User cleared comment → Delete
        else if (existingCommentId) {
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

        // 1. Save Rating (Always use current userId from props)
        // We pass "new" if userRating doesn't exist, otherwise use current id
        const { data: freshRating } = await executeAsyncRateStory({
            ...values,
            id: userRating?.id || "new",
            userId: userId,
        });

        if (!freshRating) return;

        // 2. Handle Comment Logic
        if (commentChanged) {
            await saveComment({
                trimmedComment,
                existingCommentId,
                ratingId: freshRating.id, // Use the ID returned from the server
                storyISBN,
                userId,
            });
        }

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
                            onChange={(event) => {
                                setComment(event.currentTarget.value);
                            }}
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
                                    title="submit your rating"
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
                                            title="delete your rating"
                                            variant="light"
                                            loading={isPendingDeleteRating}
                                            disabled={form.submitting}
                                            onClick={async () => {
                                                const deletedRate =
                                                    await executeAsyncDeleteRating(
                                                        {
                                                            storyISBN:
                                                                storyISBN,
                                                            userId: userId,
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
