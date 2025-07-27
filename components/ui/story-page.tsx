"use client";

import {
    StorySelectType,
    storyUpdateSchema,
    StoryUpdateType,
} from "@/zod-schemas/story";
import { userSelectType } from "@/zod-schemas/user";

import {
    ActionIcon,
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    Code,
    Group,
    Image,
    ScrollArea,
    Stack,
    Text,
    Title,
} from "@mantine/core";

import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import cx from "clsx";

import { useUpdateStory } from "@/lib/hooks/update-story-hook";
import { UseFormReturnType } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
    IconCheck,
    IconEdit,
    IconPencilMinus,
    IconPencilPlus,
    IconPhotoEdit,
    IconUserCircle,
} from "@tabler/icons-react";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useState } from "react";
import {
    UpdateStoryContent,
    UpdateStoryFormProvider,
    UpdateStorySubtitle,
    UpdateStoryTitle,
    useUpdateStoryForm,
} from "../forms/story/update-story-form-context";
import { StoryImageDropzone } from "./dropzone";

export interface StoryProps extends StorySelectType {
    author: userSelectType;
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
}: StoryProps) {
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
        },
        mode: "uncontrolled",
        validate: zod4Resolver(storyUpdateSchema),
    });

    const { executeAsync, isPending, hasSucceeded } = useUpdateStory(isbn);

    async function handleSubmit(data: StoryUpdateType) {
        // get only changed values
        if (form.isDirty()) {
            const submitData: StoryUpdateType = {};

            if (form.isDirty("bookId")) submitData.bookId = data.bookId;

            if (form.isDirty("title") && !!form.getValues().title?.trim())
                submitData.title = data.title;

            if (form.isDirty("subtitle")) submitData.subtitle = data.subtitle;

            if (form.isDirty("image")) submitData.image = data.image;

            if (form.isDirty("content") && !!form.getValues().content?.trim())
                submitData.content = data.content;

            // check if any data
            if (Object.keys(submitData).length > 0) {
                await executeAsync({
                    ...submitData,
                });

                if (hasSucceeded) {
                    form.setInitialValues(submitData);
                    form.setValues(submitData);
                }
            }
        }

        // reset neccessary form status; do not reset form
        form.resetDirty();

        // close all update input
        closeImageField();
        closeTitleField();
        closeSubtitleField();
        closeContentField();
    }

    return (
        <UpdateStoryFormProvider form={form}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card className={storypageStyles.storyCard} withBorder>
                    <Card.Section
                        className={storypageStyles.storyImageZoneSection}
                    >
                        <StoryImage
                            image={image}
                            title={title}
                            author={author}
                            openedImageField={openedImageField}
                            created={created}
                            edited={edited}
                        />

                        <StoryImageField
                            openedImageField={openedImageField}
                            form={form}
                            isPending={isPending}
                        />

                        <ActionIcon
                            onClick={() => toggleImageField()}
                            title="Update Story Image"
                            className={storypageStyles.storyImageFieldToggle}
                            color="yellow"
                            variant="subtle"
                        >
                            <IconPhotoEdit />
                        </ActionIcon>
                    </Card.Section>

                    <Stack>
                        <Box>
                            <StoryTitle
                                toggleTitleField={toggleTitleField}
                                openedTitleField={openedTitleField}
                                title={title}
                                isPending={isPending}
                                form={form}
                            />

                            <StorySubtitle
                                toggleSubtitleField={toggleSubtitleField}
                                openedSubtitleField={openedSubtitleField}
                                subtitle={subtitle}
                                isPending={isPending}
                                form={form}
                            />
                        </Box>

                        <Box>
                            <Group justify="space-between" mb={"xs"}>
                                <ActionIcon
                                    onClick={() => toggleContentField()}
                                    title="Update Story Content"
                                    variant="light"
                                    color="yellow"
                                    size={"xs"}
                                >
                                    <IconEdit />
                                </ActionIcon>

                                <ActionIcon
                                    onClick={() => toggleContentField()}
                                    title="Submit Update"
                                    variant="light"
                                    size={"xs"}
                                    type="submit"
                                    color="green"
                                    className={cx(
                                        !openedContentField && publicStyles.hide
                                    )}
                                >
                                    <IconCheck />
                                </ActionIcon>
                            </Group>

                            {/**Do not use  ScrollAreaAutosize; it causes both content and content field to appear at the same time*/}
                            <ScrollArea
                                className={cx(
                                    storypageStyles.storyContent,
                                    openedContentField && publicStyles.hide
                                )}
                                offsetScrollbars="present"
                            >
                                <Box
                                    dangerouslySetInnerHTML={{
                                        __html: content,
                                    }}
                                    className={publicStyles.forceWrapText}
                                />
                            </ScrollArea>

                            <Box
                                className={cx(
                                    !openedContentField && publicStyles.hide
                                )}
                            >
                                <UpdateStoryContent />
                            </Box>
                        </Box>
                    </Stack>
                </Card>
            </form>
        </UpdateStoryFormProvider>
    );
}

type StoryImageType = {
    image: string | null;
    title: string;
    author: userSelectType;
    created: Date;
    edited: Date | null;
    openedImageField: boolean;
};

function StoryImage({
    image,
    title,
    author,
    openedImageField,
    created,
    edited,
}: StoryImageType) {
    return (
        <Box className={cx(openedImageField && publicStyles.hide)}>
            <Box>
                <Image
                    src={image}
                    alt={title}
                    className={storypageStyles.storyImage}
                />
            </Box>

            <Box className={storypageStyles.storyBadgeTime}>
                <Badge
                    leftSection={
                        <Avatar src={author.image} size={20} variant="filled">
                            <IconUserCircle />
                        </Avatar>
                    }
                >
                    {author.name}
                </Badge>

                <Group>
                    <Code>created: {created.toLocaleTimeString()}</Code>
                    {edited && (
                        <Code>last edited: {edited.toLocaleTimeString()}</Code>
                    )}
                </Group>
            </Box>
        </Box>
    );
}

type StoryImageFieldType = {
    openedImageField: boolean;
    isPending: boolean;
    form: UseFormReturnType<StoryUpdateType>;
};

function StoryImageField({
    openedImageField,
    isPending,
    form,
}: StoryImageFieldType) {
    return (
        <Box
            className={cx(
                storypageStyles.storyImageFieldBox,
                openedImageField ? publicStyles.show : publicStyles.hide
            )}
        >
            <StoryImageDropzone
                maxFiles={1}
                form={form}
                action="update"
                field="image"
            />

            {!!form.getValues().image && (
                <Button
                    size="compact-sm"
                    mt={"sm"}
                    type="submit"
                    loading={isPending}
                >
                    upload
                </Button>
            )}
        </Box>
    );
}

type StoryTitleType = {
    openedTitleField: boolean;
    title: string;
    isPending: boolean;
    toggleTitleField: () => void;

    form: UseFormReturnType<StoryUpdateType>;
};

function StoryTitle({
    title,
    openedTitleField,
    isPending,
    toggleTitleField,
    form,
}: StoryTitleType) {
    const [dirty, setDirty] = useState(false);

    form.watch("title", ({ dirty }) => {
        setDirty(dirty);
    });

    return (
        <Group>
            <Box>
                <Title
                    className={cx(
                        storypageStyles.storyTitle,
                        openedTitleField && publicStyles.hide
                    )}
                >
                    {title}
                </Title>

                <UpdateStoryTitle
                    className={cx(!openedTitleField && publicStyles.hide)}
                    label=""
                    disabled={isPending || !openedTitleField}
                    size="md"
                />
            </Box>

            <Group>
                <ActionIcon
                    onClick={() => toggleTitleField()}
                    title="Update Story Title"
                    color="yellow"
                    size={"xs"}
                    variant="subtle"
                >
                    <IconPencilMinus />
                </ActionIcon>

                {dirty && openedTitleField && (
                    <ActionIcon
                        size="xs"
                        type="submit"
                        loading={isPending}
                        color="green"
                    >
                        <IconCheck />
                    </ActionIcon>
                )}
            </Group>
        </Group>
    );
}

type StorySubtitleType = {
    openedSubtitleField: boolean;
    subtitle: string | null;
    isPending: boolean;
    toggleSubtitleField: () => void;
    form: UseFormReturnType<StoryUpdateType>;
};

function StorySubtitle({
    subtitle,
    openedSubtitleField,
    isPending,
    toggleSubtitleField,
    form,
}: StorySubtitleType) {
    const [dirty, setDirty] = useState(false);

    form.watch("subtitle", ({ dirty }) => {
        setDirty(dirty);
    });

    return (
        <Group mt={5}>
            <Box>
                <Text
                    className={cx(
                        storypageStyles.storySubtitle,
                        openedSubtitleField && publicStyles.hide
                    )}
                    c={"dimmed"}
                >
                    {subtitle}
                </Text>

                <UpdateStorySubtitle
                    className={cx(
                        openedSubtitleField || !subtitle
                            ? publicStyles.show
                            : publicStyles.hide
                    )}
                    label=""
                    disabled={isPending || !openedSubtitleField}
                    placeholder="add a subtitle"
                />
            </Box>

            <Group align="center">
                <ActionIcon
                    onClick={() => toggleSubtitleField()}
                    title="Update Story Subtitle"
                    color="yellow"
                    size={"xs"}
                    variant="subtle"
                >
                    {subtitle ? <IconPencilMinus /> : <IconPencilPlus />}
                </ActionIcon>

                {dirty && openedSubtitleField && (
                    <ActionIcon
                        size="xs"
                        type="submit"
                        loading={isPending}
                        color="green"
                    >
                        <IconCheck />
                    </ActionIcon>
                )}
            </Group>
        </Group>
    );
}
