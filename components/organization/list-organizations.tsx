"use client";

import { authClient } from "@/lib/auth-client";
import publicStyles from "@/styles/public.module.css";
import { Box, Center, Group, Radio, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";

type ListOrganizationsProps = { id: string; slug: string } | null;

export function ListOrganizations({
    activeOrg,
}: {
    activeOrg: ListOrganizationsProps;
}) {
    const { data: organizations } = authClient.useListOrganizations();

    const [value, setValue] = useState<ListOrganizationsProps>(activeOrg);

    useEffect(() => {
        async function handleSwitchActiveOrg() {
            if (!value || activeOrg?.id === value.id) return;

            const { data, error } = await authClient.organization.setActive({
                organizationId: value.id,
                organizationSlug: value.slug,
            });

            if (error) {
                notifications.show({
                    message: `Error Activating Organization`,
                });
                return;
            }
            notifications.show({
                message: `Successfully Activated Organization: ${data.name}`,
            });
        }
        handleSwitchActiveOrg();
    }, [value, activeOrg?.id]);

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
            className={publicStyles.card}
        >
            <Group wrap="nowrap" align="flex-start">
                <Radio.Indicator />
                <Box flex={1} className={publicStyles.cardLabel}>
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
            {value && (
                <Text fz="xs" mt="md">
                    Current Draft ID: {JSON.stringify(value)}
                </Text>
            )}
        </>
    );
}
