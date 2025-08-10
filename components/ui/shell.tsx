"use client";

import { ModeToggle } from "@/components/buttons/mode-toggle";
import { authClient } from "@/lib/auth-client";
import styles from "@/styles/shell.module.css";
import { AppShell, Group, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { LoginButton } from "../buttons/login-btn";
import { LogoutButton } from "../buttons/logout-btn";

export function Shell({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();

    const { data: session } = authClient.useSession();

    return (
        <AppShell header={{ height: 60 }}>
            <AppShell.Header zIndex={900}>
                <Group className={styles.headerGroup} flex={1}>
                    <Title
                        order={3}
                        onClick={() => router.push("/")}
                        className={styles.websiteName}
                    >
                        Achebestan
                    </Title>

                    <Group gap={"xl"}>
                        {session?.user.id ? <LogoutButton /> : <LoginButton />}

                        <ModeToggle />
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Main>{children}</AppShell.Main>

            <AppShell.Footer></AppShell.Footer>
        </AppShell>
    );
}
