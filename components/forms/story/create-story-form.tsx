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
    Group,
    Indicator,
    Loader,
    Modal,
    Paper,
    Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { zod4Resolver } from "mantine-form-zod-resolver";

import { createStoryAction } from "@/lib/actions/story";
import {
    deleteDraft,
    getDraft,
    saveDraft,
    storyIndexDB,
    StoryIndexDbSchemaType,
} from "@/lib/index-db";
import { isFeatureSupported } from "@/lib/utils/pwa/is-feature-supported";
import {
    useDisclosure,
    useThrottledCallback,
    useTimeout,
} from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Drafts } from "./drafts";

export function CreateStoryForm() {
    const router = useRouter();

    const [synced, setSynced] = useState(false);

    const [drafts, setDrafts] = useState<StoryIndexDbSchemaType[]>([]);

    const [currentDraft, setCurrentDraft] =
        useState<StoryIndexDbSchemaType | null>(null);

    const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);

    const [openedDrafts, { toggle: toggleDrafts, close: closeDrafts }] =
        useDisclosure();

    const [deleteDraftOnSubmit, setDeleteDraftOnSubmit] = useState(false);

    const [savingDraft, setSavingDraft] = useState(false);

    const { start: stopSavingDraft, clear: clearOngoingStopSavingDraft } =
        useTimeout(() => setSavingDraft(false), 1000);

    const { executeAsync, isPending, hasSucceeded } = useAction(
        createStoryAction,
        {
            onSuccess(args) {
                notifications.show({
                    message: `Story '${args.data.title}' Has Been Published`,
                });

                router.replace(`/story/${args.data.isbn}`);
            },
            onError(args) {
                if (args.error.validationErrors) {
                    console.log(args.error.validationErrors);
                    Object.values(args.error.validationErrors).forEach(
                        (errorList) => {
                            errorList.forEach((errorMsg, index) =>
                                notifications.show({
                                    key: index,
                                    message: `A Validation Error Occured -> ${errorMsg}`,
                                })
                            );
                        }
                    );
                } else if (args.error.serverError) {
                    console.log(args.error.serverError);
                    notifications.show({
                        message: args.error.serverError
                            ? args.error.serverError
                            : "A Server Error Ocured",
                    });
                } else if (args.error.thrownError) {
                    if (isFeatureSupported(["serviceWorker", "SyncManager"])) {
                        setSynced(true);

                        notifications.show({
                            title: "Story Has Been Queued.",
                            message: `Your Story ${args.input.title} Will be Published When You Come Online.`,
                            autoClose: 7000,
                        });

                        router.replace("/");
                    } else {
                        notifications.show({
                            message: "An Error Ocured",
                        });
                    }
                } else {
                    notifications.show({
                        message: "An Unexpected Error Ocured",
                    });
                }
            },
        }
    );

    const form = useStoryForm({
        mode: "uncontrolled",
        validate: zod4Resolver(storyInsertSchema),
        enhanceGetInputProps: () => ({
            disabled: hasSucceeded || isPending || synced,
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

    // Load selected draft when currentDraftId changes
    useEffect(() => {
        async function loadCurrentDraft() {
            if (!currentDraftId) {
                setCurrentDraft(null);
                form.reset();
                return;
            }

            try {
                const draft = await getDraft(currentDraftId);

                if (draft) {
                    form.reset(); // clear existing inputs first
                    setCurrentDraft(draft);
                    form.setValues(draft);
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
            await executeAsync({
                ...data,
            }),
            currentDraftId &&
                deleteDraftOnSubmit &&
                (await handleDeleteDraft(currentDraftId)),
        ]);
    }

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

    return (
        <StoryFormProvider form={form}>
            <Paper withBorder p={"xs"}>
                <Group mb="md" mx="xs">
                    <Indicator
                        color={currentDraft?.id ? "yellow" : "green"}
                        processing={!!currentDraft?.id}
                        disabled={hasSucceeded || isPending || synced}
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
                        isProcessing={isPending || hasSucceeded || synced}
                    />

                    <Group mt="md">
                        <Button
                            type="submit"
                            color="green"
                            mr={"auto"}
                            loading={isPending || hasSucceeded || synced}
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
                                    setDeleteDraftOnSubmit(e.target.checked)
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
