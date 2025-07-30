"use client";

import {
    ActionIcon,
    Box,
    Group,
    Image as MantineImage,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";

import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone";

import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

import stylesPublic from "@/styles/public.module.css";
import styles from "@/styles/story-page.module.css";

import { StoryInsertType, StoryUpdateType } from "@/zod-schemas/story";
import { UseFormReturnType } from "@mantine/form";
import cx from "clsx";

type StoryImageDropzoneType =
    | Partial<DropzoneProps> &
          (
              | {
                    action: "create";
                    form: UseFormReturnType<StoryInsertType>;
                    field: keyof StoryInsertType | keyof StoryUpdateType;
                }
              | {
                    action: "update";
                    form: UseFormReturnType<StoryUpdateType>;
                    field: keyof StoryInsertType | keyof StoryUpdateType;
                }
          );

export function StoryImageDropzone({
    form,
    action,
    field,
    ...props
}: StoryImageDropzoneType) {
    const [hiddenDropzone, setHiddenDropzone] = useState(false);

    // effect for clearing image if dropzone is visibly
    useEffect(() => {
        if (!form.values.image) return;

        if (!hiddenDropzone && form.values.image.length > 0) {
            form.setFieldValue(field, []);
        }
    }, [hiddenDropzone, field, form.values.image?.length, form]);

    return (
        <Box>
            {action === "create" && (
                <FormDropZone
                    form={form}
                    hiddenDropzone={hiddenDropzone}
                    setHiddenDropzone={setHiddenDropzone}
                    field={field}
                    {...props}
                />
            )}

            {action === "update" && (
                <FormDropZone
                    form={form}
                    hiddenDropzone={hiddenDropzone}
                    setHiddenDropzone={setHiddenDropzone}
                    field={field}
                    {...props}
                />
            )}
        </Box>
    );
}

function PreviewImage({ file }: { file: File }) {
    const imageUrl = URL.createObjectURL(file);

    useEffect(() => {
        return () => URL.revokeObjectURL(imageUrl);
    }, [imageUrl]);

    return (
        <figure className={cx(stylesPublic.fullWidth, stylesPublic.marginAuto)}>
            <MantineImage
                src={imageUrl}
                onLoad={() => URL.revokeObjectURL(imageUrl)}
                className={styles.storyImage}
            />
            <figcaption>{file.name}</figcaption>
        </figure>
    );
}

type FormDropZoneType = {
    form:
        | UseFormReturnType<StoryInsertType>
        | UseFormReturnType<StoryUpdateType>;
    setHiddenDropzone: Dispatch<SetStateAction<boolean>>;
    field: keyof StoryInsertType | keyof StoryUpdateType;
    hiddenDropzone: boolean;
} & Partial<DropzoneProps>;

function FormDropZone({
    form,
    setHiddenDropzone,
    field,
    hiddenDropzone,
    ...props
}: FormDropZoneType) {
    const [image, setImage] = useState<File[]>([]);

    form.watch(field, ({ value }) => {
        if (typeof value === "object" && value) {
            setImage(value);
        }
    });

    return (
        <Box>
            <Dropzone
                onDrop={(files) => {
                    setHiddenDropzone(true);
                    form.setFieldValue(field, files);
                }}
                onReject={() => {
                    form.setFieldError(field, "Select images only");
                }}
                maxSize={5 * 1024 ** 2}
                accept={IMAGE_MIME_TYPE}
                className={cx(
                    hiddenDropzone && image.length > 0 && stylesPublic.hide
                )}
                key={form.key(field)}
                {...form.getInputProps(field)}
                {...props}
            >
                <Group
                    justify="center"
                    gap="xl"
                    mih={220}
                    className={stylesPublic.pointerEventsNone}
                >
                    <Dropzone.Accept>
                        <IconUpload
                            size={52}
                            color="var(--mantine-color-blue-6)"
                            stroke={1.5}
                        />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                        <IconX
                            size={52}
                            color="var(--mantine-color-red-6)"
                            stroke={1.5}
                        />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                        <IconPhoto
                            size={52}
                            color="var(--mantine-color-dimmed)"
                            stroke={1.5}
                        />
                    </Dropzone.Idle>

                    <div>
                        <Text size="xl" inline>
                            Drag images here or click to select files
                        </Text>
                        <Text size="sm" c="dimmed" inline mt={7}>
                            Attach as many files as you like, each file should
                            not exceed 5mb
                        </Text>
                    </div>
                </Group>
            </Dropzone>

            <Stack
                className={cx(
                    stylesPublic.fullWidth,
                    hiddenDropzone && image.length > 0
                        ? stylesPublic.show
                        : stylesPublic.hide
                )}
                gap={5}
            >
                <ActionIcon
                    onClick={() => {
                        setHiddenDropzone(false);
                        form.setFieldValue(field, []);
                    }}
                    className={cx(stylesPublic.fullWidth)}
                    variant="light"
                    color="red"
                    disabled={form.submitting}
                >
                    <IconX />
                </ActionIcon>

                <SimpleGrid cols={{ base: 1 }}>
                    {image.length > 0 ? (
                        <PreviewImage file={image[0]} />
                    ) : (
                        <Title order={3} ta={"center"}>
                            Tap X To Show Dropzone
                        </Title>
                    )}
                </SimpleGrid>
            </Stack>
        </Box>
    );
}
