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
    Group,
    Stack,
    Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconTrashFilled } from "@tabler/icons-react";
import cx from "clsx";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useEffect, useState } from "react";
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
        },
        mode: "uncontrolled",
        validate: zod4Resolver(ratingSelectSchema),
    });

    const { executeAsync: executeAsyncRateStory } = useRateStory();

    const { executeAsync: executeAsyncCreateComment } = useCreateComment();

    const { executeAsync: executeAsyncUpdateComment } = useUpdateComment();

    const { executeAsync: executeAsyncDeleteComment } = useDeleteComment();

    const {
        executeAsync: executeAsyncDeleteRating,
        isPending: isPendingDeleteRating,
    } = useDeleteRating();

    const [commentChanged, setCommentChanged] = useState(false);

    useEffect(() => {
        const currentComment = comment?.trim() || "";
        const existingComment = userRating?.comment?.text?.trim() || "";
        setCommentChanged(currentComment !== existingComment);
    }, [comment, userRating?.comment?.text]);

    async function saveRating(
        data: RatingSelectType,
        currentRatingId?: number
    ): Promise<UserRatingWithComment | undefined> {
        const { data: rated } = await executeAsyncRateStory({
            id: currentRatingId || "new",
            stars: data.stars,
            storyISBN: data.storyISBN,
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

    async function handleSubmit(data: RatingSelectType) {
        const trimmedComment = comment?.trim();
        const existingCommentId = userRating?.comment?.id;

        let freshRating = userRating;
        let freshRatingId =
            typeof freshRating?.id === "number" ? freshRating.id : undefined;

        // Step 1: Save rating first if needed
        if (form.isDirty()) {
            freshRating = await saveRating(data, freshRatingId);
            if (!freshRating) return;
            freshRatingId =
                typeof freshRating.id === "number" ? freshRating.id : undefined;
        }

        // Step 2: Handle comment - ✅ Only if comment was actually changed
        if (commentChanged) {
            await saveComment({
                trimmedComment,
                existingCommentId,
                ratingId: freshRatingId,
                storyISBN,
                userId,
            });
        }

        // Step 3: Close form
        closeRatingForm();
    }

    return (
        <Affix {...props}>
            <RatingFormProvider form={form}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack className={ratingStyles.ratingStack}>
                        <Group justify="space-between">
                            <Stack>
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
                                                    : publicStyles.hide
                                            )}
                                        >
                                            <IconCheck />
                                        </ActionIcon>
                                        {userRating?.id &&
                                            typeof userRating.id ===
                                                "number" && (
                                                <ActionIcon
                                                    size={"xs"}
                                                    color="red"
                                                    title="delete your rating"
                                                    variant="light"
                                                    loading={
                                                        isPendingDeleteRating
                                                    }
                                                    disabled={form.submitting}
                                                    onClick={async () => {
                                                        const deletedRate =
                                                            await executeAsyncDeleteRating(
                                                                {
                                                                    storyISBN:
                                                                        storyISBN,
                                                                    userId: userId,
                                                                }
                                                            );

                                                        if (deletedRate) {
                                                            setComment("");
                                                            form.setFieldValue(
                                                                "stars",
                                                                0
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
                        </Group>
                    </Stack>
                </form>
            </RatingFormProvider>
        </Affix>
    );
}
