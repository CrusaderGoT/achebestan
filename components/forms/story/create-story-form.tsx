"use client";

import {
    StoryFormFields,
    StoryFormProvider,
    useStoryForm,
} from "@/components/forms/story/create-story-form-context";

import { StoryInsertType } from "@/types/story";
import { storyInsertSchema } from "@/zod-schemas/story";

import {
    Button,
    Checkbox,
    type ComboboxItem,
    Group,
    Indicator,
    Loader,
    Modal,
    Paper,
    Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { zod4Resolver } from "mantine-form-zod-resolver";

import { deleteDraft, getDraft, saveDraft } from "@/lib/index-db";
import { StoryIndexDbSchemaType } from "@/types/story";
import {
    useDisclosure,
    useThrottledCallback,
    useTimeout,
} from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { BooksSelect } from "@/components/book/books-select";
import { deleteStoryDraftFromDb } from "@/lib/actions/story";
import { useCreateStory } from "@/lib/hooks/story/create-story";
import {
    useMergedDrafts,
    useSyncStoryDraftToDb,
} from "@/lib/hooks/story/story-draft";
import { toFormBookId } from "@/lib/utils/book/book-part-id-conversion";
import { useQueryClient } from "@tanstack/react-query";
import { Drafts } from "./drafts";

export function CreateStoryForm({ authorId }: { authorId: string }) {
    const queryclient = useQueryClient();

    const [synced, setSynced] = useState(false);

    const [currentDraft, setCurrentDraft] =
        useState<StoryIndexDbSchemaType | null>(null);

    const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);

    const [openedDrafts, { toggle: toggleDrafts, close: closeDrafts }] =
        useDisclosure();

    const [deleteDraftOnSubmit, setDeleteDraftOnSubmit] = useState(false);

    const [savingDraft, setSavingDraft] = useState(false);

    const [savingDraftToDb, setSavingDraftToDb] = useState(false);

    const { start: stopSavingDraft, clear: clearOngoingStopSavingDraft } =
        useTimeout(() => setSavingDraft(false), 1000);

    const [book, setBook] = useState<ComboboxItem | null>(null);

    const {
        executeAsync: executeAsyncCreateStory,
        isPending: isPendingCreateStory,
        hasSucceeded: hasSucceededCreateStory,
    } = useCreateStory(setSynced);

    const form = useStoryForm({
        mode: "uncontrolled",
        validate: zod4Resolver(storyInsertSchema),
        enhanceGetInputProps: () => ({
            disabled: hasSucceededCreateStory || isPendingCreateStory || synced,
        }),
    });

    const { executeAsync: executeAsyncSyncStoryDraftToDb } =
        useSyncStoryDraftToDb();

    const throttledSaveDraftToDb = useThrottledCallback(
        async (draftData: StoryIndexDbSchemaType) => {
            try {
                await executeAsyncSyncStoryDraftToDb(draftData);

                queryclient.invalidateQueries({
                    queryKey: ["user-story-drafts", { userId: authorId }],
                });
            } catch (e) {
                console.log("Couldn't save draft to database", e);
            } finally {
                setSavingDraftToDb(false);
            }
        },
        1000,
    );

    const { data: drafts } = useMergedDrafts({ authorId });

    // Load selected draft when currentDraftId changes or clear it.
    // Fix: if IndexedDB has no record for this id (cross-device scenario),
    // fall back to the already-fetched merged drafts (which includes remote DB
    // data) and seed local IndexedDB from it so future reads on this device work.
    useEffect(() => {
        async function loadCurrentDraft() {
            if (!currentDraftId) {
                setCurrentDraft(null);
                form.reset();
                setBook(null);
                return;
            }

            try {
                let draftData = await getDraft(currentDraftId);

                // Cross-device fallback: IndexedDB is empty on a fresh device.
                // Find the draft in the remote-inclusive merged list and seed
                // this device's IndexedDB so subsequent reads work locally.
                if (!draftData) {
                    const remoteFallback = drafts.find(
                        (d) => d.id === currentDraftId,
                    );

                    if (remoteFallback) {
                        await saveDraft(remoteFallback);
                        draftData = await getDraft(currentDraftId);
                    }
                }

                if (draftData) {
                    const { book: draftBook, ...draft } = draftData;

                    form.reset();
                    setCurrentDraft(draftData);
                    form.setValues(draft);

                    // draftBook is only stored in IndexedDB — it won't exist on
                    // a fresh device. Fall back to bookId so the field value is
                    // correct even if the ComboboxItem label is temporarily missing
                    // (BooksSelect will re-hydrate the label on its own).
                    if (draftBook) {
                        setBook(draftBook);
                        form.setFieldValue("bookId", toFormBookId(draftBook));
                    }

                    if (openedDrafts) {
                        closeDrafts();
                    }
                } else {
                    notifications.show({
                        message: "Draft not found",
                        color: "red",
                    });
                }
            } catch (error) {
                console.error("Failed to load draft:", error);
                notifications.show({
                    message: "Failed to load draft",
                    color: "red",
                });
            }
        }
        loadCurrentDraft();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDraftId]);

    const throttledSaveDraft = useThrottledCallback(async () => {
        const currentFormValues = form.getValues();

        if (!currentFormValues) return;

        try {
            setSavingDraft(true);

            const draftData: Partial<StoryIndexDbSchemaType> = {
                ...currentFormValues,
                ...(currentDraft && {
                    id: currentDraft.id,
                    created: currentDraft.created,
                }),
                book: book,
                authorId: authorId,
            };

            const savedDraftId = await saveDraft(draftData);

            // Fix: always refresh currentDraft from IndexedDB after every save,
            // not just for new drafts. Without this, the sync effect receives
            // a stale closure — the version before the last edit — and the DB
            // ends up one keystroke behind forever.
            const refreshedDraft = await getDraft(savedDraftId);
            if (refreshedDraft) {
                setCurrentDraft(refreshedDraft);
                if (!currentDraft) {
                    setCurrentDraftId(savedDraftId);
                }
            }

            setSavingDraftToDb(true);

            // Fix: invalidate with the user-scoped key to match useMergedDrafts
            queryclient.invalidateQueries({
                queryKey: ["indexdb-drafts", { userId: authorId }],
            });
        } catch (error) {
            console.error("Failed to save draft:", error);
        } finally {
            clearOngoingStopSavingDraft();
            stopSavingDraft();
        }
    }, 1000);

    async function handleDeleteDraft(draftId: number) {
        try {
            await deleteDraft(draftId);

            await deleteStoryDraftFromDb(draftId);

            // Fix: both invalidations now use the user-scoped key
            queryclient.invalidateQueries({
                queryKey: ["indexdb-drafts", { userId: authorId }],
            });

            queryclient.invalidateQueries({
                queryKey: ["user-story-drafts", { userId: authorId }],
            });

            if (currentDraft?.id === draftId) {
                setCurrentDraft(null);
                setCurrentDraftId(null);
                form.reset();
            }

            notifications.show({
                message: "Draft deleted successfully",
            });
        } catch (error) {
            console.error("Failed to delete draft:", error);
            notifications.show({
                message: "Failed to delete draft",
                color: "red",
            });
        }
    }

    form.watch("content", ({ value, previousValue }) => {
        if (previousValue !== value) {
            throttledSaveDraft();
        }
    });

    useEffect(() => {
        if (!form.isDirty()) return;
        throttledSaveDraft();
    }, [book]);

    useEffect(() => {
        if (!currentDraft || !savingDraftToDb) return;
        throttledSaveDraftToDb(currentDraft);
    }, [currentDraft, savingDraftToDb]);

    async function handleSubmit(data: StoryInsertType) {
        await Promise.all([
            await executeAsyncCreateStory({
                ...data,
                bookId: toFormBookId(book),
            }),
            !!currentDraftId &&
                hasSucceededCreateStory &&
                deleteDraftOnSubmit &&
                (await handleDeleteDraft(currentDraftId)),
        ]);
    }

    return (
        <StoryFormProvider form={form}>
            <Paper withBorder p={"xs"}>
                <Group mb="md" mx="xs">
                    <Indicator
                        color={currentDraft?.id ? "yellow" : "green"}
                        processing={!!currentDraft?.id}
                        disabled={
                            hasSucceededCreateStory ||
                            isPendingCreateStory ||
                            synced
                        }
                        zIndex={20}
                    />

                    <Text fw={500} size="xs">
                        {currentDraft?.id
                            ? `Editing Draft #${currentDraft.id}`
                            : "New Draft"}{" "}
                        {(savingDraft || savingDraftToDb) && (
                            <Loader
                                size={10}
                                color={
                                    savingDraft
                                        ? "yellow"
                                        : savingDraftToDb
                                          ? "blue"
                                          : "green"
                                }
                            />
                        )}
                    </Text>

                    {(currentDraftId || currentDraft) && (
                        <Button
                            onClick={() => {
                                setCurrentDraft(null);
                                setCurrentDraftId(null);
                                form.reset();
                            }}
                            variant="default"
                            size="xs"
                            ml="auto"
                        >
                            New Draft
                        </Button>
                    )}

                    {drafts.length > 0 && (
                        <Button
                            onClick={toggleDrafts}
                            variant="light"
                            ml="auto"
                            size="xs"
                        >
                            Open Drafts ({drafts.length})
                        </Button>
                    )}
                </Group>

                <Modal
                    opened={openedDrafts}
                    onClose={closeDrafts}
                    centered
                    title="Drafts"
                >
                    <Drafts
                        drafts={drafts}
                        setCurrentDraftId={setCurrentDraftId}
                        currentDraftId={currentDraftId}
                        onDeleteDraft={handleDeleteDraft}
                    />
                </Modal>

                <form
                    onSubmit={form.onSubmit(handleSubmit)}
                    onChange={throttledSaveDraft}
                >
                    <StoryFormFields
                        isProcessing={
                            isPendingCreateStory ||
                            hasSucceededCreateStory ||
                            synced
                        }
                    />

                    <BooksSelect book={book} setBook={setBook} />

                    <Group mt="md">
                        <Button
                            type="submit"
                            color="green"
                            mr={"auto"}
                            loading={
                                isPendingCreateStory ||
                                hasSucceededCreateStory ||
                                synced
                            }
                        >
                            Submit
                        </Button>

                        {(currentDraft || currentDraftId) && (
                            <Checkbox
                                ml="auto"
                                label="Delete Draft"
                                size="sm"
                                checked={deleteDraftOnSubmit}
                                onChange={(e) =>
                                    setDeleteDraftOnSubmit(
                                        e.currentTarget.checked,
                                    )
                                }
                                color={"red"}
                                icon={IconTrash}
                                iconColor="black"
                            />
                        )}
                    </Group>
                </form>
            </Paper>
        </StoryFormProvider>
    );
}
