"use client";

import {
    ActionIcon,
    Alert,
    Button,
    Group,
    Mark,
    Modal,
    Stack,
} from "@mantine/core";

import { useDeleteStory } from "@/lib/hooks/delete-story-hook";
import { useDisclosure } from "@mantine/hooks";
import { IconTrashX } from "@tabler/icons-react";

import publicStyles from "@/styles/public.module.css";
import { redirect } from "next/navigation";

export function DeleteStory({
    isbn,
    storyTitle,
}: {
    isbn: string;
    storyTitle: string;
}) {
    const [opened, { open: openDeleteModal, close: closeDeleteModal }] =
        useDisclosure(false);

    const { executeAsync, isPending } = useDeleteStory();

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
                                {storyTitle.toUpperCase()}
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
                                disabled={isPending}
                                color="red"
                            >
                                Delete
                            </Button>

                            <Button
                                onClick={() => closeDeleteModal()}
                                disabled={isPending}
                                color="gray"
                            >
                                Cancel
                            </Button>
                        </Group>
                    </Stack>
                </Modal.Body>
            </Modal>

            <ActionIcon onClick={openDeleteModal} variant="subtle" color="red">
                <IconTrashX />
            </ActionIcon>
        </>
    );
}
