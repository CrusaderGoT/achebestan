import { UpdateStorySubtitle } from "@/components/forms/story/update-story-form-context";
import { StoryUpdateType } from "@/zod-schemas/story";
import { ActionIcon, Box, Group, Text } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import {
    IconCheck,
    IconPencilMinus,
    IconPencilPlus,
} from "@tabler/icons-react";
import { useState } from "react";

import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import cx from "clsx";

type StorySubtitleType = {
    openedSubtitleField: boolean;
    subtitle: string | null;
    isPending: boolean;
    toggleSubtitleField: () => void;
    form: UseFormReturnType<StoryUpdateType>;
};

export function StorySubtitle({
    subtitle,
    openedSubtitleField,
    isPending,
    toggleSubtitleField,
    form,
}: StorySubtitleType) {
    const [dirty, setDirty] = useState(false);

    form.watch("subtitle", ({ dirty }) => {
        setDirty(dirty);
    });

    return (
        <Group mt={5}>
            <Box>
                <Text
                    className={cx(
                        storypageStyles.storySubtitle,
                        openedSubtitleField && publicStyles.hide
                    )}
                    c={"dimmed"}
                >
                    {subtitle}
                </Text>

                <UpdateStorySubtitle
                    className={cx(
                        openedSubtitleField || !subtitle
                            ? publicStyles.show
                            : publicStyles.hide
                    )}
                    label=""
                    disabled={isPending || !openedSubtitleField}
                    placeholder="add a subtitle"
                />
            </Box>

            <Group align="center">
                <ActionIcon
                    onClick={() => {
                        toggleSubtitleField();
                        form.resetField("subtitle");
                    }}
                    title="Update Story Subtitle"
                    color="yellow"
                    size={"xs"}
                    variant="subtle"
                    disabled={isPending}
                >
                    {subtitle ? <IconPencilMinus /> : <IconPencilPlus />}
                </ActionIcon>

                {dirty && openedSubtitleField && (
                    <ActionIcon
                        size="xs"
                        type="submit"
                        loading={isPending}
                        color="green"
                    >
                        <IconCheck />
                    </ActionIcon>
                )}
            </Group>
        </Group>
    );
}
