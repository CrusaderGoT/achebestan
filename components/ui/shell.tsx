"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";
import styles from "@/styles/shell.module.css";
import { AppShell, Group, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { LoginButton } from "./login-btn";

export function Shell({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();

    return (
        <AppShell header={{ height: 60 }}>
            <AppShell.Header zIndex={900}>
                <Group className={styles.headerGroup}>
                    <Title order={3} onClick={() => router.push("/")}>
                        Achebestan
                    </Title>

                    <Group gap={"xl"}>
                        <LoginButton />
                        <ModeToggle />
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Main>{children}</AppShell.Main>

            <AppShell.Footer></AppShell.Footer>
        </AppShell>
    );
}
