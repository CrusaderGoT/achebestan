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

import {
    Dropzone,
    DropzoneProps,
    FileWithPath,
    IMAGE_MIME_TYPE,
} from "@mantine/dropzone";

import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";

import { useState } from "react";

import styles from "@/styles/post.module.css";
import stylesPublic from "@/styles/public.module.css";

import cx from "clsx";

export function ImageUpload(props: Partial<DropzoneProps>) {
    const [files, setFiles] = useState<FileWithPath[]>([]);

    const [hiddenDropzone, setHiddenDropzone] = useState(false);

    const previews = files.map((file, index) => {
        const imageUrl = URL.createObjectURL(file);
        return (
            <figure
                key={index}
                className={cx(stylesPublic.fullWidth, stylesPublic.marginAuto)}
            >
                <MantineImage
                    key={index}
                    src={imageUrl}
                    onLoad={() => URL.revokeObjectURL(imageUrl)}
                    className={styles.postImage}
                />
                <figcaption>{file.name}</figcaption>
            </figure>
        );
    });

    return (
        <Box>
            <Dropzone
                onDrop={(files) => {
                    setFiles(files);
                    setHiddenDropzone(!hiddenDropzone);
                }}
                onReject={(files) => console.error("rejected files", files)}
                maxSize={5 * 1024 ** 2}
                accept={IMAGE_MIME_TYPE}
                {...props}
                className={cx(hiddenDropzone ? stylesPublic.hide : "")}
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
                    onClick={() => setHiddenDropzone(!hiddenDropzone)}
                    color="red"
                    className={cx(stylesPublic.fullWidth)}
                >
                    <IconX />
                </ActionIcon>

                <SimpleGrid cols={{ base: 1 }}>{previews}</SimpleGrid>
            </Stack>
        </Box>
    );
}
