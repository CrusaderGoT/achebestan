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

import {
    deleteDraft,
    getDraft,
    saveDraft,
    storyIndexDB,
    StoryIndexDbSchemaType,
} from "@/lib/index-db";
import {
    useDisclosure,
    useThrottledCallback,
    useTimeout,
} from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { BooksSelect } from "@/components/book/books-select";
import { useCreateStory } from "@/lib/hooks/story/create-story-hook";
import {
    toFormBookId,
    toFormBookPart,
} from "@/lib/utils/book/book-part-id-conversion";
import { Drafts } from "./drafts";

export function CreateStoryForm() {
    const [synced, setSynced] = useState(false);

    const [drafts, setDrafts] = useState<StoryIndexDbSchemaType[]>([]);

    const [currentDraft, setCurrentDraft] =
        useState<StoryIndexDbSchemaType | null>(null);

    const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);

    const [openedDrafts, { toggle: toggleDrafts, close: closeDrafts }] =
        useDisclosure();

    const [deleteDraftOnSubmit, setDeleteDraftOnSubmit] = useState(true);

    const [savingDraft, setSavingDraft] = useState(false);

    const { start: stopSavingDraft, clear: clearOngoingStopSavingDraft } =
        useTimeout(() => setSavingDraft(false), 1000);

    const [bookId, setBookId] = useState<ComboboxItem | null>(null);

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

    // Load all drafts on mount
    useEffect(() => {
        async function loadDrafts() {
            try {
                const { drafts } = await storyIndexDB();
                if (drafts.length > 0) {
                    setDrafts(drafts);
                }
            } catch (error) {
                console.error("Failed to load drafts:", error);
            }
        }
        loadDrafts();
    }, []);

    // Load selected draft when currentDraftId changes or clear it
    useEffect(() => {
        async function loadCurrentDraft() {
            if (!currentDraftId) {
                setCurrentDraft(null);
                form.reset();
                setBookId(null);
                return;
            }

            try {
                const draftData = await getDraft(currentDraftId);

                if (draftData) {
                    const {
                        bookId: draftBookId,
                        bookPart: draftBookPart,
                        ...draft
                    } = draftData;

                    form.reset();
                    setBookId(draftBookId ?? null); // UI state stays as ComboboxItem
                    setCurrentDraft(draft);
                    form.setValues(draft);
                    // Single, explicit conversion for form values:
                    form.setFieldValue("bookId", toFormBookId(draftBookId));
                    form.setFieldValue(
                        "bookPart",
                        toFormBookPart(draftBookPart)
                    );

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

            const draftData = {
                ...currentFormValues,
                ...(currentDraft && {
                    id: currentDraft.id,
                    created: currentDraft.created,
                }),
                bookId, // store the full ComboboxItem so the label survives reload
            };

            const newDraftId = await saveDraft(draftData);

            if (!currentDraft) {
                const newDraft = await getDraft(newDraftId);
                if (newDraft) {
                    setCurrentDraft(newDraft);
                    setCurrentDraftId(newDraftId);
                }
            }

            // Refresh drafts list
            const { drafts: updatedDrafts } = await storyIndexDB();
            setDrafts(updatedDrafts);
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

            // Refresh drafts list
            const { drafts: updatedDrafts } = await storyIndexDB();
            setDrafts(updatedDrafts);

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

    const {
        start: startSaveContentDraft,
        clear: clearOngoingSaveContentDraft,
    } = useTimeout(() => {
        throttledSaveDraft();
    }, 1000);

    form.watch("content", ({ value, previousValue }) => {
        if (previousValue !== value) {
            clearOngoingSaveContentDraft(); // clear any ongoing timeout
            startSaveContentDraft();
        }
    });

    async function handleSubmit(data: StoryInsertType) {
        await Promise.all([
            await executeAsyncCreateStory({
                ...data,
                bookId: toFormBookId(bookId),
            }),
            currentDraftId &&
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
                        {savingDraft && <Loader size={10} />}
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

                    <BooksSelect bookId={bookId} setBookId={setBookId} />

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
                                        e.currentTarget.checked
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
