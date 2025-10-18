"use client";

import { authClient } from "@/lib/auth-client";
import { Box, Center, Group, Radio, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ListOrganizations() {
    const { data: organizations } = authClient.useListOrganizations();

    const [value, setValue] = useState<{ id: string; slug: string } | null>(
        null
    );

    const router = useRouter();

    useEffect(() => {
        async function setActiveOrg() {
            if (!value) return;

            const { data, error } = await authClient.organization.setActive({
                organizationId: value.id,
                organizationSlug: value.slug,
            });

            if (error) {
                notifications.show({
                    message: `Error Activating Organization: ${value} -> ${error.message}`,
                });
                return;
            }
            notifications.show({
                message: `Successfully Activated Organization: ${data.name}`,
            });
            router.refresh();
        }
        setActiveOrg();
    }, [value, router]);

    if (!organizations || organizations.length < 1)
        return (
            <Center>
                <Text c="dimmed">No Organizations Created Yet..</Text>
            </Center>
        );

    const cards = organizations.map((org) => (
        <Radio.Card
            key={org.id}
            radius={"md"}
            value={`${JSON.stringify({ id: org.id, slug: org.slug })}`}
            h={80}
            //className={formStyles.draftCard}
        >
            <Group wrap="nowrap" align="flex-start">
                <Radio.Indicator />
                <Box
                    flex={1}
                    //className={formStyles.draftLabel}
                >
                    <Text fw={500}>{org.name}</Text>
                </Box>
            </Group>
        </Radio.Card>
    ));

    return (
        <>
            <Radio.Group
                value={JSON.stringify(value)}
                onChange={(value) => {
                    setValue(value ? JSON.parse(value) : null);
                }}
                label="Select an Organization"
                description="Choose a draft to continue working on"
            >
                <Stack pt="md" gap="xs">
                    {cards}
                </Stack>
            </Radio.Group>
        </>
    );
}
