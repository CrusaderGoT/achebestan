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
        setCommentChanged(
            comment?.trim() !== userRatingState?.comment?.text.trim()
        );
    }, [comment, userRatingState?.comment?.text]);

    async function handleSubmit(data: RatingSelectType) {
        const trimmedComment = comment?.trim();
        let finalRatingId = userRatingState?.id;

        const commentInState = !!trimmedComment;
        const existingCommentId = userRatingState?.comment?.id;

        // --------------------------
        // Step 1: Save rating first (if changed)
        // --------------------------
        if (form.isDirty("stars")) {
            const { data: rated } = await executeAsyncRateStory({
                id: finalRatingId || "new",
                stars: data.stars,
                storyISBN: data.storyISBN,
            });

            if (!rated) {
                notifications.show({
                    message: "An Error Occurred While Submitting Your Rating",
                    color: "red",
                });
                return; // stop everything if rating fails
            }

            finalRatingId = rated.id;

            // Update UI state
            setUserRatingState(rated);

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
            form.resetDirty()
        }

        // --------------------------
        // Step 2: Handle comment changes (after rating is ensured)
        // --------------------------
        if (commentChanged) {
            // Case A: User typed something in the comment box
            if (commentInState) {
                if (existingCommentId) {
                    // Update existing comment
                    const { data: updatedComment } =
                        await executeAsyncUpdateComment({
                            text: trimmedComment,
                            storyISBN: storyISBN,
                            userId: userId,
                            commentId: existingCommentId,
                        });

                    if (!updatedComment) {
                        notifications.show({
                            message:
                                "An Error Occurred While Updating Your Comment",
                            color: "red",
                        });
                    } else {
                        setComment(updatedComment.text);
                        setUserRatingState((prev) =>
                            prev
                                ? { ...prev, comment: updatedComment }
                                : {
                                      id: finalRatingId || "new",
                                      stars: 0,
                                      storyISBN: storyISBN,
                                      comment: updatedComment,
                                  }
                        );
                    }
                } else {
                    // Create new comment (only if rating exists)
                    if (!finalRatingId || typeof finalRatingId !== "number") {
                        notifications.show({
                            message:
                                "You Must Rate The Story, To Make A Comment Here",
                        });
                    } else {
                        const { data: newComment } =
                            await executeAsyncCreateComment({
                                storyISBN: storyISBN,
                                ratingId: finalRatingId,
                                text: trimmedComment,
                                userId: userId,
                            });

                        if (!newComment) {
                            notifications.show({
                                message:
                                    "An Error Occurred While Adding Your Comment",
                                color: "red",
                            });
                        } else {
                            setComment(newComment.text);
                            setUserRatingState((prev) =>
                                prev
                                    ? { ...prev, comment: newComment }
                                    : {
                                          id: finalRatingId,
                                          stars: 0,
                                          storyISBN: storyISBN,
                                          comment: newComment,
                                      }
                            );
                        }
                    }
                }
            }
            // Case B: User cleared the comment box but had a comment before → Delete it
            else if (existingCommentId) {
                await executeAsyncDeleteComment({
                    commentId: existingCommentId,
                    userId: userId,
                });

                setComment(undefined);
                setUserRatingState((prev) =>
                    prev
                        ? { ...prev, comment: null }
                        : {
                              id: finalRatingId || "new",
                              stars: 0,
                              storyISBN: storyISBN,
                              comment: null,
                          }
                );
            }
        }

        // --------------------------
        // Step 3: Close form
        // --------------------------
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
                                                            setComment(
                                                                undefined
                                                            );
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
