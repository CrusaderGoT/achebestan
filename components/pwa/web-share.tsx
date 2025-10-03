"use client";

import { useWebShare } from "@/lib/hooks/pwa/use-web-share";
import { ActionIcon, Group, Text } from "@mantine/core";
import { IconDotsCircleHorizontal } from "@tabler/icons-react";

export function WebShare({ title, text, url }: ShareData) {
    const { isSupported, share } = useWebShare();

    if (!isSupported) return null;

    return (
        <ActionIcon
            variant="default"
            onClick={async () => {
                await share({ text, title, url });
            }}
            size={"input-md"}
        >
            <Group gap={"xs"} wrap="nowrap">
                <IconDotsCircleHorizontal size={16} />

                <Text visibleFrom="xs">More Share</Text>
            </Group>
        </ActionIcon>
    );
}
