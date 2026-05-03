"use client";

import { sanitizeHTML } from "@/lib/utils/sanitize-html";
import formStyles from "@/styles/story/radio-card.module.css";
import { StoryIndexDbSchemaType } from "@/types/story";
import { ActionIcon, Box, Group, Radio, Stack, Text } from "@mantine/core";
import { randomId } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";

export function Drafts({
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
        <Group key={draft.id || randomId()} wrap="nowrap">
            <Radio.Card
                key={draft.id || randomId()}
                radius={"md"}
                value={`${draft.id}`}
                className={formStyles.draftCard}
            >
                <Group wrap="nowrap" align="flex-start">
                    <Radio.Indicator />

                    <Box className={formStyles.draftLabel} flex={1}>
                        <Text fw={500}>{draft.title || "Untitled Draft"}</Text>

                        <Box
                            dangerouslySetInnerHTML={{
                                __html:
                                    sanitizeHTML(draft.content).trim() ||
                                    "No Content Yet",
                            }}
                            className={formStyles.draftDescription}
                        />

                        <Text size="xs" c="dimmed" mt={4}>
                            {new Date(draft.updated).toLocaleDateString()} at{" "}
                            {new Date(draft.updated).toLocaleTimeString()}
                        </Text>
                    </Box>
                </Group>
            </Radio.Card>

            <ActionIcon
                variant="outline"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (draft.id) {
                        onDeleteDraft(draft.id);
                    }
                }}
                size="sm"
                color="red"
            >
                <IconTrash size={14} />
            </ActionIcon>
        </Group>
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

            <Group>
                {currentDraftId && (
                    <Text fz="xs" mt="md">
                        Current Draft ID: {currentDraftId}
                    </Text>
                )}
            </Group>
        </>
    );
}
