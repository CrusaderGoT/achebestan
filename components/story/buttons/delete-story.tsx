"use client";

import {
    ActionIcon,
    Alert,
    Button,
    Group,
    Mark,
    Modal,
    Stack,
    Tooltip,
} from "@mantine/core";

import { useDeleteStory } from "@/lib/hooks/story/delete-story";
import { useDisclosure } from "@mantine/hooks";
import { IconTrashX } from "@tabler/icons-react";

import publicStyles from "@/styles/public.module.css";

import { PickedStoryProps } from "@/types/story";
import { redirect } from "next/navigation";

export function DeleteStory({ isbn, title, authorId }: PickedStoryProps) {
    const [opened, { open: openDeleteModal, close: closeDeleteModal }] =
        useDisclosure(false);

    const { executeAsync, isPending, hasSucceeded } = useDeleteStory(authorId);

    return (
        <>
            <Modal
                opened={opened}
                onClose={closeDeleteModal}
                withCloseButton={false}
                size={"auto"}
                centered
                closeOnClickOutside={!isPending}
                closeOnEscape={!isPending}
            >
                <Modal.Body>
                    <Stack>
                        <Alert>
                            You Are About To Permanently Delete{" "}
                            <Mark className={publicStyles.highlightText}>
                                {title.toUpperCase()}
                            </Mark>
                            .
                        </Alert>

                        <Group justify="space-between">
                            <Button
                                onClick={async () => {
                                    const deleted = await executeAsync({
                                        isbn: isbn,
                                    });
                                    if (deleted.data?.title) {
                                        redirect("/");
                                    }
                                }}
                                disabled={isPending || hasSucceeded}
                                color="red"
                            >
                                Delete
                            </Button>

                            <Button
                                onClick={() => closeDeleteModal()}
                                disabled={isPending || hasSucceeded}
                                color="gray"
                            >
                                Cancel
                            </Button>
                        </Group>
                    </Stack>
                </Modal.Body>
            </Modal>

            <Tooltip label={"Delete"} withArrow position="top">
                <ActionIcon
                    onClick={openDeleteModal}
                    variant="transparent"
                    color="red"
                    size="lg"
                    radius="xl"
                    aria-label={"Delete this story"}
                >
                    <IconTrashX size={24} stroke={1.5} />
                </ActionIcon>
            </Tooltip>
        </>
    );
}
