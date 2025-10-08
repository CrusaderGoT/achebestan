"use client";

import {
    StoryFormFields,
    StoryFormProvider,
    useStoryForm,
} from "@/components/forms/story/create-story-form-context";

import { StoryInsertType } from "@/types/story";
import { storyInsertSchema } from "@/zod-schemas/story";

import {
    ActionIcon,
    Box,
    Button,
    Group,
    Indicator,
    Modal,
    Paper,
    Radio,
    Stack,
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
} from "@/lib/hooks/story/use-index-db";
import { isFeatureSupported } from "@/lib/utils/pwa/is-feature-supported";
import { sanitizeHTML } from "@/lib/utils/sanitize-html";
import { randomId, useDisclosure, useThrottledCallback } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import formStyles from "@/styles/story/create-story-form-styles.module.css";

export function CreateStoryForm() {
    const router = useRouter();

    const [synced, setSynced] = useState(false);

    const { executeAsync, isPending, hasSucceeded } = useAction(
        createStoryAction,
        {
            async onSuccess(args) {
                // Delete the current draft on successful submission
                if (currentDraft?.id) {
                    try {
                        await deleteDraft(currentDraft.id);
                        notifications.show({
                            message: "Draft deleted successfully",
                        });
                    } catch (error) {
                        console.error("Failed to delete draft:", error);
                    }
                }

                notifications.show({
                    message: `Story '${args.data.title.toLocaleUpperCase()}' Has Been Published`,
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

    const [drafts, setDrafts] = useState<StoryIndexDbSchemaType[]>([]);
    const [currentDraft, setCurrentDraft] =
        useState<StoryIndexDbSchemaType | null>(null);
    const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);

    const [openedDrafts, { toggle: toggleDrafts, close: closeDrafts }] =
        useDisclosure();

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
                    setCurrentDraft(draft);
                    form.setValues(draft);
                    closeDrafts();
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
        }
    }, 1000);

    form.watch("content", () => {
        throttledSaveDraft();
    });

    async function handleSubmit(data: StoryInsertType) {
        await executeAsync({
            ...data,
        });
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
            <Paper withBorder p={"xs"} pos={"relative"}>
                <Group mb="md">
                    <Indicator
                        color={currentDraft?.id ? "red" : "green"}
                        processing={!!currentDraft?.id}
                        position="middle-start"
                        disabled={hasSucceeded || isPending || synced}
                    />

                    <Text fw={500}>
                        {currentDraft?.id
                            ? `Editing Draft #${currentDraft.id}`
                            : "New Draft"}
                    </Text>

                    {drafts.length > 0 && (
                        <Button
                            onClick={toggleDrafts}
                            variant="light"
                            ml="auto"
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
                    <StoryFormFields />

                    <Button
                        type="submit"
                        mt="md"
                        color="green"
                        loading={isPending || hasSucceeded || synced}
                        rightSection={
                            isPending ? (
                                <Text>Submitting Story...</Text>
                            ) : hasSucceeded ? (
                                <Text>Redirecting To New Story...</Text>
                            ) : synced ? (
                                <Text>Redirecting To Home...</Text>
                            ) : null
                        }
                    >
                        Submit
                    </Button>
                </form>
            </Paper>
        </StoryFormProvider>
    );
}

function Drafts({
    drafts,
    currentDraftId,
    setCurrentDraftId,
    onDeleteDraft,
}: {
    drafts: StoryIndexDbSchemaType[];
    currentDraftId: number | null;
    setCurrentDraftId: Dispatch<SetStateAction<number | null>>;
    onDeleteDraft: (id: number) => void;
}) {
    const cards = drafts.map((draft) => (
        <Radio.Card
            key={draft.id || randomId()}
            radius={"md"}
            value={`${draft.id}`}
            className={formStyles.draftCard}
        >
            <Group wrap="nowrap" align="flex-start" justify="space-between">
                <Group wrap="nowrap" align="flex-start" style={{ flex: 1 }}>
                    <Radio.Indicator />
                    <Box style={{ flex: 1 }} className={formStyles.draftLabel}>
                        <Text fw={500}>{draft.title || "Untitled"}</Text>

                        <Box
                            size="sm"
                            c="dimmed"
                            dangerouslySetInnerHTML={{
                                __html:
                                    sanitizeHTML(draft.content).slice(0, 50) ||
                                    "No Content",
                            }}
                            className={formStyles.draftDescription}
                        />

                        <Text size="xs" c="dimmed" mt={4}>
                            {new Date(draft.updated).toLocaleDateString()} at{" "}
                            {new Date(draft.updated).toLocaleTimeString()}
                        </Text>
                    </Box>
                </Group>
                <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (draft.id) {
                            onDeleteDraft(draft.id);
                        }
                    }}
                >
                    <IconTrash size={18} />
                </ActionIcon>
            </Group>
        </Radio.Card>
    ));

    return (
        <>
            <Radio.Group
                value={currentDraftId?.toString() || ""}
                onChange={(value) =>
                    setCurrentDraftId(value ? Number(value) : null)
                }
                label="Select a draft to edit"
                description="Choose a draft to continue working on"
            >
                <Stack pt="md" gap="xs">
                    {cards.length > 0 ? (
                        cards
                    ) : (
                        <Text c="dimmed" ta="center" py="xl">
                            No drafts available
                        </Text>
                    )}
                </Stack>
            </Radio.Group>

            {currentDraftId && (
                <Text fz="xs" mt="md">
                    Current Draft ID: {currentDraftId}
                </Text>
            )}
        </>
    );
}
