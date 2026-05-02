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
            {
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
            }
        },
        1000,
    );

    const { data: drafts } = useMergedDrafts({ authorId });

    // Load selected draft when currentDraftId changes or clear it
    useEffect(() => {
        async function loadCurrentDraft() {
            if (!currentDraftId) {
                setCurrentDraft(null);
                form.reset();
                setBook(null);
                return;
            }

            try {
                const draftData = await getDraft(currentDraftId);

                if (draftData) {
                    const { book: draftBook, ...draft } = draftData;

                    form.reset();
                    setCurrentDraft(draftData);
                    form.setValues(draft);
                    setBook(draftBook ?? null);
                    // explicit conversion for form values:
                    form.setFieldValue("bookId", toFormBookId(draftBook));

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
                book: book, // store the full ComboboxItem so the label survives reload
                authorId: authorId,
            };

            const savedDraftId = await saveDraft(draftData);

            if (!currentDraft) {
                const newDraft = await getDraft(savedDraftId);
                if (newDraft) {
                    setCurrentDraft(newDraft);
                    setCurrentDraftId(savedDraftId);
                }
            }

            // sync to db
            setSavingDraftToDb(true);

            queryclient.invalidateQueries({
                queryKey: ["indexdb-drafts"],
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

            queryclient.invalidateQueries({
                queryKey: ["indexdb-drafts"],
            });

            queryclient.invalidateQueries({
                queryKey: ["user-story-drafts", { userId: authorId }],
            });

            // If we deleted the current draft, reset the form
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

    // effect for monitoring content rich text editor change; form onChange does not register it.
    form.watch("content", ({ value, previousValue }) => {
        if (previousValue !== value) {
            throttledSaveDraft();
        }
    });

    // effect for monitoring book combobox change, should only save if form has other values
    useEffect(() => {
        if (!form.isDirty()) return;

        throttledSaveDraft();
    }, [book]);

    // effect for syncing draft to database
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
