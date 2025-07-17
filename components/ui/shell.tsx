"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";
import styles from "@/styles/shell.module.css";
import { AppShell, Group, Title } from "@mantine/core";

export function Shell({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AppShell header={{ height: 60 }}>
            <AppShell.Header>
                <Group className={styles.headerGroup}>
                    <Title order={3}>Achebestan</Title>

                    <ModeToggle />
                </Group>
            </AppShell.Header>

            <AppShell.Main>{children}</AppShell.Main>

            <AppShell.Footer></AppShell.Footer>
        </AppShell>
    );
}
