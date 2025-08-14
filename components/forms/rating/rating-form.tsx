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
} from "@/lib/hooks/comment-hook";
import { useDeleteRating } from "@/lib/hooks/delete-rating-hook";
import { useRateStory } from "@/lib/hooks/rate-story-hook";
import { calculateRatingsAverage } from "@/lib/utils/calculate-ratings-average";
import publicStyles from "@/styles/public.module.css";
import ratingStyles from "@/styles/rating.module.css";
import {
    ratingSelectSchema,
    RatingSelectType,
    UserRatingWithComment,
} from "@/zod-schemas/story";
import {
    ActionIcon,
    Affix,
    AffixProps,
    Group,
    Stack,
    Text,
    Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconTrashFilled } from "@tabler/icons-react";
import cx from "clsx";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type RatingFormProps = {
    storyISBN: string;
    userId: string;
    setRating: Dispatch<SetStateAction<number>>;
    closeRatingForm: () => void;
    ratings: RatingSelectType[];
    userRating?: UserRatingWithComment;
} & Partial<AffixProps>;

export function RatingForm({
    setRating,
    ratings,
    closeRatingForm,
    userRating,
    storyISBN,
    userId,
    ...props
}: RatingFormProps) {
    const [userRatingState, setUserRatingState] = useState<
        UserRatingWithComment | undefined
    >(userRating);

    const [comment, setComment] = useState(userRating?.comment?.text);

    const form = useRatingForm({
        initialValues: {
            storyISBN: storyISBN,
            stars: userRatingState?.stars || 0,
            id: userRatingState?.id || "new",
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
        const existingComment = userRatingState?.comment?.text?.trim() || "";
        setCommentChanged(currentComment !== existingComment);
    }, [comment, userRatingState?.comment?.text]);

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
                message: "An Error Occurred While Submitting Your Rating",
                color: "red",
            });
            return undefined;
        }

        // ✅ Preserve existing comment when updating rating
        const updatedRating = {
            ...rated,
            comment: userRatingState?.comment,
        };

        // Update UI state immediately - preserve comment
        setUserRatingState(updatedRating);

        // Update ratings array
        const existingIndex = ratings.findIndex(
            (r) => r.userId === rated.userId
        );
        if (existingIndex >= 0) {
            ratings[existingIndex] = rated;
        } else {
            ratings.push(rated);
        }
        setRating(calculateRatingsAverage(ratings));

        form.resetDirty();

        return updatedRating; // ✅ Return merged data
    }

    async function saveComment({
        trimmedComment,
        commentChanged,
        existingCommentId,
        ratingId,
        storyISBN,
        userId,
    }: {
        trimmedComment: string | undefined;
        commentChanged: boolean;
        existingCommentId?: number;
        ratingId?: number;
        storyISBN: string;
        userId: string;
    }) {
        const commentInState = !!trimmedComment;

        if (!commentChanged) return;

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
                    return;
                }

                setComment(updatedComment.text);
                setUserRatingState((prev) =>
                    prev
                        ? { ...prev, comment: updatedComment }
                        : {
                              id: ratingId || "new",
                              stars: 0,
                              storyISBN,
                              comment: updatedComment,
                          }
                );
            } else {
                // Create
                if (!ratingId || typeof ratingId !== "number") {
                    notifications.show({
                        message:
                            "You Must Rate The Story, To Make A Comment Here",
                    });
                    return;
                }

                const { data: newComment } = await executeAsyncCreateComment({
                    storyISBN,
                    ratingId,
                    text: trimmedComment!,
                    userId,
                });

                if (!newComment) {
                    notifications.show({
                        message: "An Error Occurred While Adding Your Comment",
                        color: "red",
                    });
                    return;
                }

                setComment(newComment.text);
                setUserRatingState((prev) =>
                    prev
                        ? { ...prev, comment: newComment }
                        : {
                              id: ratingId,
                              stars: 0,
                              storyISBN,
                              comment: newComment,
                          }
                );
            }
        }
        // Case B: User cleared comment → Delete
        else if (existingCommentId) {
            await executeAsyncDeleteComment({
                commentId: existingCommentId,
                userId,
            });

            setComment(undefined);
            setUserRatingState((prev) =>
                prev
                    ? { ...prev, comment: null }
                    : {
                          id: ratingId || "new",
                          stars: 0,
                          storyISBN,
                          comment: null,
                      }
            );
        }
    }

    async function handleSubmit(data: RatingSelectType) {
        const trimmedComment = comment?.trim();
        const existingCommentId = userRatingState?.comment?.id;

        // ✅ Calculate comment change directly
        const originalComment = userRating?.comment?.text?.trim() || "";
        const currentComment = trimmedComment || "";
        const wasCommentChanged = currentComment !== originalComment;

        let freshRating = userRatingState;
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
        if (wasCommentChanged) {
            await saveComment({
                trimmedComment,
                commentChanged: wasCommentChanged,
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
                                <Text>{JSON.stringify(commentChanged)}</Text>
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
                                        {userRatingState?.id &&
                                            typeof userRatingState.id ===
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
                                                            setUserRatingState({
                                                                id: "new",
                                                                stars: 0,
                                                                storyISBN:
                                                                    storyISBN,
                                                            });
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
