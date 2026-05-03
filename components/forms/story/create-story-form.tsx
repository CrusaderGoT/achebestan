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
import { useEffect, useMemo, useState } from "react";

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
                const result = await executeAsyncSyncStoryDraftToDb(draftData);
                const serverId = result?.data?.id;

                if (!serverId) {
                    // Action failed validation or threw — don't invalidate,
                    // don't pretend the sync succeeded.
                    console.error(
                        "Draft sync failed:",
                        result?.serverError ?? result?.validationErrors,
                    );
                    return;
                }

                // Server may have assigned a different ID than IndexedDB did
                // (e.g. first draft on a new browser always gets local id=1,
                // but server may already have id=1 from another browser).
                // Reconcile: delete the old local entry, re-save with server id.
                if (draftData.id && serverId !== draftData.id) {
                    await deleteDraft(draftData.id);
                    await saveDraft({ ...draftData, id: serverId }, authorId);
                    setCurrentDraft((prev) =>
                        prev ? { ...prev, id: serverId } : null,
                    );
                    setCurrentDraftId(serverId);
                }

                queryclient.invalidateQueries({
                    queryKey: ["user-story-drafts", { userId: authorId }],
                });
            } catch (e) {
                console.error("Couldn't save draft to database:", e);
            } finally {
                setSavingDraftToDb(false);
            }
        },
        1000,
    );

    const { data: mergedData = [] } = useMergedDrafts({ userId: authorId });

    const drafts = useMemo(() => {
        const map = new Map<number, StoryIndexDbSchemaType>();

        mergedData.forEach((incomingItem) => {
            const id = incomingItem.id;

            if (id == null) return;

            const existingItem = map.get(id);

            if (!existingItem) {
                map.set(id, incomingItem);
            } else if (incomingItem.updated >= existingItem.updated) {
                // >= so remote (later in spread) wins ties
                map.set(id, incomingItem);
            }
        });

        return Array.from(map.values()).sort((a, b) => b.updated - a.updated);
    }, [mergedData]);

    useEffect(() => {
        async function loadCurrentDraft() {
            if (!currentDraftId) {
                setCurrentDraft(null);
                form.reset();
                setBook(null);
                return;
            }

            try {
                // 1. Fetch local draft and find remote draft
                const localDraft = await getDraft(currentDraftId);
                const remoteDraft = drafts.find((d) => d.id === currentDraftId);

                // 2. Determine the absolute latest draft
                // (Using new Date() ensures safe comparison if 'updated' is an ISO string)
                const latestDraft =
                    localDraft && remoteDraft
                        ? new Date(localDraft.updated) >=
                          new Date(remoteDraft.updated)
                            ? localDraft
                            : remoteDraft
                        : (localDraft ?? remoteDraft);

                // 3. Handle 404 case
                if (!latestDraft) {
                    notifications.show({
                        message: "Draft not found",
                        color: "red",
                    });
                    return;
                }

                // 4. Sync local storage if the remote draft was newer or local was missing
                if (latestDraft === remoteDraft && latestDraft !== localDraft) {
                    await saveDraft(latestDraft, authorId);
                }

                // 5. Populate the form using the LATEST data, not just the local data
                const { book: draftBook, ...draft } = latestDraft;

                form.reset();
                setCurrentDraft(latestDraft);
                form.setValues(draft);

                if (draftBook) {
                    setBook(draftBook);
                    form.setFieldValue("bookId", toFormBookId(draftBook));
                }

                if (openedDrafts) {
                    closeDrafts();
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

            const savedDraftId = await saveDraft(
                draftData as StoryIndexDbSchemaType,
                authorId,
            );

            const refreshedDraft = await getDraft(savedDraftId);
            if (refreshedDraft) {
                setCurrentDraft(refreshedDraft);
                if (!currentDraft) {
                    setCurrentDraftId(savedDraftId);
                }
            }

            queryclient.invalidateQueries({
                queryKey: ["user-story-drafts", { userId: authorId }],
            });

            setSavingDraftToDb(true);
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

            queryclient.invalidateQueries({
                queryKey: ["user-story-drafts", { userId: authorId }],
            });

            if (currentDraft?.id === draftId) {
                setCurrentDraft(null);
                setCurrentDraftId(null);
                form.reset();
            }

            notifications.show({ message: "Draft deleted successfully" });
        } catch (error) {
            console.error("Failed to delete draft:", error);
            notifications.show({
                message: "Failed to delete draft",
                color: "red",
            });
        }
    }

    async function handleSubmit(data: StoryInsertType) {
        const result = await executeAsyncCreateStory({
            ...data,
            bookId: toFormBookId(book),
        });

        if (result?.data && currentDraftId && deleteDraftOnSubmit) {
            await handleDeleteDraft(currentDraftId);
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
        if (!currentDraft || !savingDraftToDb || !form.isDirty("content"))
            return;
        throttledSaveDraftToDb(currentDraft);
    }, [currentDraft, savingDraftToDb]);

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
