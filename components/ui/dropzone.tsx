"use client";

import {
    ActionIcon,
    Box,
    Button,
    Group,
    Image as MantineImage,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";

import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone";

import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";

import { useEffect, useState } from "react";

import stylesPublic from "@/styles/public.module.css";
import styles from "@/styles/story-page.module.css";

import { authClient } from "@/lib/auth-client";
import { handleFileUpload } from "@/lib/utils/image-upload";
import { StoryInsertType, StoryUpdateType } from "@/types/story";
import { UseFormReturnType } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import cx from "clsx";

type ImageDropzoneType =
    | Partial<DropzoneProps> &
          (
              | {
                    action: "createStory";
                    form: UseFormReturnType<StoryInsertType>;
                    field: keyof StoryInsertType | keyof StoryUpdateType;
                }
              | {
                    action: "updateStory";
                    form: UseFormReturnType<StoryUpdateType>;
                    field: keyof StoryInsertType | keyof StoryUpdateType;
                }
              | ({
                    action: "uploadImage";
                } & UploadImageDropZoneProps)
          );

export function ImageDropzone({ action, ...props }: ImageDropzoneType) {
    return (
        <Box>
            {action === "createStory" && (
                <FormDropZone
                    {...props}
                    form={
                        (
                            props as Extract<
                                ImageDropzoneType,
                                { action: "createStory" }
                            >
                        ).form
                    }
                    field={
                        (
                            props as Extract<
                                ImageDropzoneType,
                                { action: "createStory" }
                            >
                        ).field
                    }
                />
            )}
            {action === "updateStory" && (
                <FormDropZone
                    {...props}
                    form={
                        (
                            props as Extract<
                                ImageDropzoneType,
                                { action: "updateStory" }
                            >
                        ).form
                    }
                    field={
                        (
                            props as Extract<
                                ImageDropzoneType,
                                { action: "updateStory" }
                            >
                        ).field
                    }
                />
            )}
            {action === "uploadImage" && (
                <UploadImageDropZone
                    {...(props as Extract<
                        ImageDropzoneType,
                        { action: "uploadImage" }
                    >)}
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
    field: keyof StoryInsertType | keyof StoryUpdateType;
} & Partial<DropzoneProps>;

function FormDropZone({ form, field, ...props }: FormDropZoneType) {
    const [image, setImage] = useState<File[]>([]);

    const [hiddenDropzone, setHiddenDropzone] = useState(false);

    // effect for clearing image if dropzone is visibly
    useEffect(() => {
        if (!form.values.image) return;

        if (!hiddenDropzone && form.values.image.length > 0) {
            form.setFieldValue(field, []);
        }
    }, [hiddenDropzone, field, form.values.image?.length, form]);

    form.watch(field, ({ value }) => {
        if (typeof value === "object" && value) {
            setImage(value);
        }
    });

    return (
        <>
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
                <DropZoneDetails />
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
        </>
    );
}

export type UploadImageDropZoneProps = {
    imageUniqueId?: string;
    onSetttled?: () => void;
} & Partial<DropzoneProps>;

function UploadImageDropZone({
    imageUniqueId,
    onSetttled,
    ...props
}: UploadImageDropZoneProps) {
    const [uploading, setUploading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const [image, setImage] = useState<File | null>(null);

    const [hiddenDropzone, setHiddenDropzone] = useState(false);

    useEffect(() => {
        if (!error) return;

        notifications.show({
            message: error,
            autoClose: 5000,
            color: "red",
        });

        const timer = setTimeout(() => setError(null), 5000);
        return () => clearTimeout(timer);
    }, [error, setError]);

    async function upload(file: File) {
        setUploading(true);
        try {
            const newUserImage = await handleFileUpload(file, imageUniqueId, {
                throwOnError: true,
            });

            if (!newUserImage) {
                throw new Error("Upload Failed");
            }

            const { data } = await authClient.updateUser({
                image: newUserImage.secure_url,
            });

            if (!data?.status) {
                throw new Error("Failed To Update User Image");
            } else {
                if (onSetttled) {
                    onSetttled();
                }
                setImage(null);
            }
        } catch (e) {
            const errMsg =
                e instanceof Error
                    ? e.message
                    : "An Unknown Error Occured While Uploading Your Image, Try Again.";
            notifications.show({
                title: "User Image Upload Error",
                message: errMsg,
            });
        } finally {
            setUploading(false);
        }
    }

    return (
        <>
            <Dropzone
                onDrop={(files) => {
                    setImage(files[0]);
                    setHiddenDropzone(true);
                }}
                onReject={() => {
                    setError("Select Image Not Bigger Than 5mb");
                }}
                maxSize={5 * 1024 ** 2}
                accept={IMAGE_MIME_TYPE}
                className={cx(hiddenDropzone && image && stylesPublic.hide)}
                {...props}
            >
                <DropZoneDetails />
            </Dropzone>

            <Stack
                className={cx(
                    stylesPublic.fullWidth,
                    hiddenDropzone && image
                        ? stylesPublic.show
                        : stylesPublic.hide
                )}
                gap={5}
            >
                <ActionIcon
                    onClick={() => {
                        setHiddenDropzone(false);
                    }}
                    className={cx(stylesPublic.fullWidth)}
                    variant="light"
                    color="red"
                    disabled={uploading}
                >
                    <IconX />
                </ActionIcon>

                <SimpleGrid cols={{ base: 1 }}>
                    {image ? (
                        <PreviewImage file={image} />
                    ) : (
                        <Title order={3} ta={"center"}>
                            Tap X To Show Dropzone
                        </Title>
                    )}
                </SimpleGrid>

                <Button
                    onClick={async () => {
                        if (!image) {
                            notifications.show({
                                message: "No Image In DropZone",
                            });
                            return;
                        }
                        await upload(image);
                    }}
                    fullWidth
                    loading={uploading}
                >
                    Upload
                </Button>
            </Stack>
        </>
    );
}

function DropZoneDetails() {
    return (
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
                    Attach one image file, should not exceed 5mb
                </Text>
            </div>
        </Group>
    );
}
