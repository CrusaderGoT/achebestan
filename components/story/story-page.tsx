"use client";

import { StorySelectType, StoryUpdateType } from "@/types/story";
import { storyUpdateSchema } from "@/zod-schemas/story";
import { UserSelectType } from "@/zod-schemas/user";

import { ActionIcon, Box, Card, Stack } from "@mantine/core";

import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import cx from "clsx";

import { StoryContent } from "@/components/story/story-content";
import { StoryImage } from "@/components/story/story-image";
import { StoryImageField } from "@/components/story/story-image-field";
import { StorySubtitle } from "@/components/story/story-subtitle";
import { StoryTitle } from "@/components/story/story-title";

import { authClient } from "@/lib/auth-client";
import { useUpdateStory } from "@/lib/hooks/story/update-story-hook";

import { useDisclosure } from "@mantine/hooks";
import { IconPhotoEdit } from "@tabler/icons-react";
import { zod4Resolver } from "mantine-form-zod-resolver";

import {
    UpdateStoryFormProvider,
    useUpdateStoryForm,
} from "@/components/forms/story/update-story-form-context";

import { useState } from "react";

export interface StoryProps extends StorySelectType {
    author: UserSelectType;
}

export function Story({
    image,
    author,
    title,
    subtitle,
    content,
    created,
    edited,
    isbn,
    id,
    bookId,
    blurb,
}: StoryProps) {
    const [story, setStory] = useState<StorySelectType>({
        image: image,
        title: title,
        subtitle: subtitle,
        content: content,
        created: created,
        edited: edited,
        isbn: isbn,
        id: id,
        bookId: bookId,
        authorId: author.id,
        blurb: blurb,
    });

    const [
        openedImageField,
        { toggle: toggleImageField, close: closeImageField },
    ] = useDisclosure(false);

    const [
        openedTitleField,
        { toggle: toggleTitleField, close: closeTitleField },
    ] = useDisclosure(false);

    const [
        openedSubtitleField,
        { toggle: toggleSubtitleField, close: closeSubtitleField },
    ] = useDisclosure(false);

    const [
        openedContentField,
        { toggle: toggleContentField, close: closeContentField },
    ] = useDisclosure(false);

    const form = useUpdateStoryForm({
        initialValues: {
            title: title,
            subtitle: subtitle,
            content: content,
            image: [],
        },
        mode: "uncontrolled",
        cascadeUpdates: true,
        validate: zod4Resolver(storyUpdateSchema),
    });

    const { executeAsync, isPending } = useUpdateStory(isbn, author.id);

    async function handleSubmit(data: StoryUpdateType) {
        // check if changed values or if image is present
        if (form.isDirty() || form.values.image.length > 0) {
            const submitData: StoryUpdateType = { image: [] };

            if (form.isDirty("bookId")) submitData.bookId = data.bookId;

            // make sure non empty string
            if (form.isDirty("title") && !!form.getValues().title?.trim())
                submitData.title = data.title;

            if (form.isDirty("subtitle")) submitData.subtitle = data.subtitle;

            // if image exists in form submission
            if (form.values.image.length > 0) submitData.image = data.image;

            // make sure non empty tag; tag with space will submit
            if (form.isDirty("content") && !!form.getValues().content?.trim())
                submitData.content = data.content;

            // check if any data
            const excludedFields: Array<keyof StoryUpdateType> = [
                "subtitle",
                "bookId",
            ];

            const isNotEmpty = (
                Object.keys(submitData) as Array<keyof StoryUpdateType>
            ).some((key) => {
                if (excludedFields.includes(key)) {
                    return true;
                } else if (key === "image") {
                    return submitData[key].length > 0;
                } else {
                    return Boolean(submitData[key]);
                }
            });

            if (isNotEmpty) {
                const updatedStory = await executeAsync({
                    ...submitData,
                });

                if (updatedStory.data) {
                    // reset neccessary form status;
                    form.setInitialValues(submitData);
                    form.setValues(submitData);
                    form.resetDirty();

                    // clear and close dropzone
                    form.setFieldValue("image", []);
                    closeImageField();

                    // set story reactively
                    setStory(updatedStory.data);
                }
            }
        }

        // close all update input
        closeTitleField();
        closeSubtitleField();
        closeContentField();
    }

    const session = authClient.useSession();

    return (
        <UpdateStoryFormProvider form={form}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card className={storypageStyles.storyCard} withBorder>
                    <Card.Section
                        className={storypageStyles.storyImageZoneSection}
                    >
                        {openedImageField ? (
                            <StoryImageField
                                openedImageField={openedImageField}
                                form={form}
                                isPending={isPending}
                                session={session}
                                storyAuthorId={story.authorId}
                            />
                        ) : (
                            <StoryImage
                                image={story.image}
                                title={story.title}
                                created={story.created}
                                edited={story.edited}
                                author={author}
                                openedImageField={openedImageField}
                            />
                        )}

                        <ActionIcon
                            onClick={() => {
                                toggleImageField();
                            }}
                            title="Update Story Image"
                            className={cx(
                                storypageStyles.storyImageFieldToggle,
                                story.authorId !== session.data?.user.id &&
                                    publicStyles.hide
                            )}
                            color="yellow"
                            variant="light"
                            disabled={isPending}
                        >
                            <IconPhotoEdit />
                        </ActionIcon>
                    </Card.Section>

                    <Stack mt="md">
                        <Box>
                            <StoryTitle
                                title={story.title}
                                toggleTitleField={toggleTitleField}
                                openedTitleField={openedTitleField}
                                isPending={isPending}
                                form={form}
                                session={session}
                                storyAuthorId={story.authorId}
                            />

                            <StorySubtitle
                                subtitle={story.subtitle}
                                toggleSubtitleField={toggleSubtitleField}
                                openedSubtitleField={openedSubtitleField}
                                isPending={isPending}
                                form={form}
                                session={session}
                                storyAuthorId={story.authorId}
                            />
                        </Box>

                        <StoryContent
                            content={story.content}
                            toggleContentField={toggleContentField}
                            openedContentField={openedContentField}
                            form={form}
                            session={session}
                            storyAuthorId={story.authorId}
                            storyISBN={story.isbn}
                        />
                    </Stack>
                </Card>
            </form>
        </UpdateStoryFormProvider>
    );
}
