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

        // check if values has changed
        if (form.isDirty()) {
            const { data: rated } = await executeAsyncRateStory({
                id: userRatingState?.id || "new",
                stars: data.stars,
                storyISBN: data.storyISBN,
            });

            if (rated) {
                setUserRatingState(rated);

                // Instead of pushing, update the ratings array properly
                const existingIndex = ratings.findIndex(
                    (r) => r.userId === rated.userId
                );

                if (existingIndex >= 0) {
                    // Update existing rating in place
                    ratings[existingIndex] = rated;
                } else {
                    // Add new rating
                    ratings.push(rated);
                }

                // Calculate new average (don't pass rated again since it's already in ratings)
                setRating(calculateRatingsAverage(ratings));
            }
        }

        const commentInState = !!trimmedComment;

        const existingCommentId = userRatingState?.comment?.id;

        const ratingId = userRatingState?.id;

        const existingRating = typeof ratingId === "number";

        // Handle comment changes if any
        if (commentChanged && commentInState) {
            if (existingCommentId) {
                // Update existing comment

                const { data: updatedComment } =
                    await executeAsyncUpdateComment({
                        text: trimmedComment,
                        storyISBN: storyISBN,
                        userId: userId,
                        commentId: existingCommentId,
                    });

                if (updatedComment) {
                    // make both comment states same, to indicate comment in textarea and userrating are same
                    setComment(updatedComment.text);

                    setUserRatingState((prev) =>
                        prev
                            ? {
                                  ...prev,
                                  comment: updatedComment,
                              }
                            : {
                                  id: "new",
                                  stars: 0,
                                  storyISBN: storyISBN,
                                  comment: updatedComment,
                              }
                    );
                } else {
                    notifications.show({
                        message:
                            "An Error Occurred While Updating Your Comment",
                        color: "red",
                    });
                }
            } else {
                // Create new comment only if there was already a rating(number)
                if (existingRating) {
                    const { data: newComment } =
                        await executeAsyncCreateComment({
                            storyISBN: storyISBN,
                            ratingId: ratingId,
                            text: trimmedComment,
                            userId: userId, // redundant, set via context in safe action
                        });

                    if (newComment) {
                        setComment(newComment.text);

                        setUserRatingState((prev) =>
                            prev
                                ? {
                                      ...prev,
                                      comment: newComment,
                                  }
                                : {
                                      id: "new",
                                      stars: 0,
                                      storyISBN: storyISBN,
                                      comment: newComment,
                                  }
                        );
                    } else {
                        notifications.show({
                            message:
                                "An Error Occurred While Adding Your Comment",
                            color: "red",
                        });
                    }
                } else {
                    notifications.show({
                        message:
                            "You Must Rate The Story, To Make A Comment Here",
                    });
                }
            }
        } else if (commentChanged && !commentInState && existingCommentId) {
            await executeAsyncDeleteComment({
                commentId: existingCommentId,
                userId: userId, // redundant, set via context in safe action
            });

            setComment(undefined);

            setUserRatingState((prev) =>
                prev
                    ? {
                          ...prev,
                          comment: null,
                      }
                    : {
                          id: "new",
                          stars: 0,
                          storyISBN: storyISBN,
                          comment: null,
                      }
            );
        }

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
