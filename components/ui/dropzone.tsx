"use client";

import {
    ActionIcon,
    Box,
    Group,
    Image as MantineImage,
    SimpleGrid,
    Stack,
    Text,
} from "@mantine/core";

import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone";

import { useStoryFormContext } from "../forms/story-form-context";

import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";

import { useState } from "react";

import stylesPublic from "@/styles/public.module.css";
import styles from "@/styles/story-page.module.css";

import cx from "clsx";

export function StoryImageDropzone(props: Partial<DropzoneProps>) {
    const form = useStoryFormContext();

    const [hiddenDropzone, setHiddenDropzone] = useState(false);

    return (
        <Box>
            <Dropzone
                onDrop={(files) => {
                    setHiddenDropzone(true);
                    console.error(files[0].path);
                    form.setFieldValue("image", files[0]);
                }}
                onReject={() => {
                    form.setFieldError("files", "Select images only");
                }}
                maxSize={5 * 1024 ** 2}
                accept={IMAGE_MIME_TYPE}
                className={cx(hiddenDropzone ? stylesPublic.hide : "")}
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
                    !hiddenDropzone ? stylesPublic.hide : "",
                    stylesPublic.fullWidth
                )}
                gap={5}
            >
                <ActionIcon
                    onClick={() => {
                        setHiddenDropzone(false);
                        form.setFieldValue("image", undefined);
                    }}
                    className={cx(stylesPublic.fullWidth)}
                >
                    <IconX />
                </ActionIcon>

                <SimpleGrid cols={{ base: 1 }}>
                    <PreviewImage file={form.getValues().image} />
                </SimpleGrid>
            </Stack>
        </Box>
    );
}

function PreviewImage({ file }: { file: File | undefined }) {
    if (file) {
        const imageUrl = URL.createObjectURL(file);
        return (
            <figure
                className={cx(stylesPublic.fullWidth, stylesPublic.marginAuto)}
            >
                <MantineImage
                    src={imageUrl}
                    onLoad={() => URL.revokeObjectURL(imageUrl)}
                    className={styles.storyImage}
                />
                <figcaption>{file.name}</figcaption>
            </figure>
        );
    }
    return <IconPhoto />;
}
