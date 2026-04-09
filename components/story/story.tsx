"use client";

import { StoryProps, StorySelectType, StoryUpdateType } from "@/types/story";
import { storyUpdateSchema } from "@/zod-schemas/story";

import {
    ActionIcon,
    Anchor,
    Card,
    ComboboxItem,
    Flex,
    Stack,
    Text,
} from "@mantine/core";

import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import cx from "clsx";

import { StoryContent } from "@/components/story/story-content";
import { StoryImage } from "@/components/story/story-image";
import { StoryImageField } from "@/components/story/story-image-field";
import { StorySubtitle } from "@/components/story/story-subtitle";
import { StoryTitle } from "@/components/story/story-title";

import { useUpdateStory } from "@/lib/hooks/story/update-story-hook";

import { useDisclosure } from "@mantine/hooks";
import { IconPhotoEdit } from "@tabler/icons-react";
import { zod4Resolver } from "mantine-form-zod-resolver";

import {
    UpdateStoryFormProvider,
    useUpdateStoryForm,
} from "@/components/forms/story/update-story-form-context";

import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { useGetStoryBook } from "@/lib/hooks/book/get-story-book";
import { useState } from "react";
import { AddStoryToBook } from "./story-add-to-book";

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
    bookPart,
    blurb,
    permissions,
}: StoryProps) {
    const { sessionUser } = useCentralizedAuth();

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
        bookPart: bookPart,
        authorId: author.id,
        blurb: blurb,
    });

    const [bookIdState, setBookIdState] = useState<ComboboxItem | null>(null);

    const { data: book } = useGetStoryBook({ bookId });

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
            image: undefined,
        },
        mode: "uncontrolled",
        cascadeUpdates: true,
        validate: zod4Resolver(storyUpdateSchema),
    });

    const { executeAsync, isPending } = useUpdateStory(isbn, author.id);

    async function handleSubmit(data: StoryUpdateType) {
        // check if changed values or if image is present
        if (form.isDirty() || form.values.image) {
            const submitData: StoryUpdateType = { image: undefined };

            if (form.isDirty("bookId")) submitData.bookId = data.bookId;

            // make sure non empty string
            if (form.isDirty("title") && !!form.getValues().title?.trim())
                submitData.title = data.title;

            if (form.isDirty("subtitle")) submitData.subtitle = data.subtitle;

            // if image exists in form submission
            if (form.values.image) submitData.image = data.image;

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
                    return !!submitData[key];
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
                    form.setFieldValue("image", undefined);
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

    const selectedBookId =
        bookIdState != null ? Number(bookIdState.value) : null;

    const showMoveToBookButton =
        selectedBookId !== null &&
        (bookId == null || Number(bookId) !== selectedBookId);

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
                                session={sessionUser}
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
                                !permissions?.canUpdate && publicStyles.hide,
                            )}
                            color="yellow"
                            variant="light"
                            disabled={isPending}
                        >
                            <IconPhotoEdit />
                        </ActionIcon>
                    </Card.Section>

                    <Stack mt="md">
                        <Flex
                            direction={{ base: "column", lg: "row" }}
                            justify={"space-between"}
                        >
                            <Stack gap={1}>
                                <StoryTitle
                                    title={story.title}
                                    toggleTitleField={toggleTitleField}
                                    openedTitleField={openedTitleField}
                                    isPending={isPending}
                                    form={form}
                                    permissions={permissions}
                                />

                                <StorySubtitle
                                    subtitle={story.subtitle}
                                    toggleSubtitleField={toggleSubtitleField}
                                    openedSubtitleField={openedSubtitleField}
                                    isPending={isPending}
                                    form={form}
                                    permissions={permissions}
                                />

                                {book && (
                                    <Text size="xs" c="dimmed">
                                        a chapter of{" "}
                                        <Anchor
                                            href={`/books/${book.id}`}
                                            className={
                                                publicStyles.highlightText
                                            }
                                        >
                                            {book.name}
                                        </Anchor>
                                    </Text>
                                )}
                            </Stack>

                            <AddStoryToBook
                                showMoveToBookButton={showMoveToBookButton}
                                canUpdate={permissions?.canUpdate}
                                bookIdState={bookIdState}
                                setBookIdState={setBookIdState}
                                executeAsync={executeAsync}
                            />
                        </Flex>

                        <StoryContent
                            content={story.content}
                            toggleContentField={toggleContentField}
                            openedContentField={openedContentField}
                            form={form}
                            storyISBN={story.isbn}
                            permissions={permissions}
                        />
                    </Stack>
                </Card>
            </form>
        </UpdateStoryFormProvider>
    );
}
