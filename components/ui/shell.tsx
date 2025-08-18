"use client";

import { ModeToggle } from "@/components/buttons/mode-toggle";
import { authClient } from "@/lib/auth-client";
import styles from "@/styles/shell.module.css";
import { AppShell, Burger, Group, Title, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import cx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LoginButton } from "../buttons/login-btn";
import { LogoutButton } from "../buttons/logout-btn";
import { navlinkData, NavLinks } from "./navlinks";

export function Shell({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();

    const pathname = usePathname();

    const { data: session } = authClient.useSession();

    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: { desktop: true, mobile: !opened },
            }}
        >
            <AppShell.Header zIndex={900}>
                <Group className={styles.headerGroup} flex={1} gap={"xl"}>
                    <Title
                        order={3}
                        onClick={() => router.push("/")}
                        className={styles.websiteName}
                    >
                        Achebestan
                    </Title>

                    <Group justify="space-around" visibleFrom="sm" flex={1}>
                        {navlinkData.map((item, index) => (
                            <UnstyledButton
                                key={index}
                                component={Link}
                                href="#required-for-focus"
                                className={cx(
                                    styles.mobileNavBar,
                                    pathname === item.href &&
                                        styles.mobileNavBarActive
                                )}
                            >
                                {item.label}
                            </UnstyledButton>
                        ))}
                    </Group>

                    <Group gap={"xl"}>
                        {session?.user.id ? <LogoutButton /> : <LoginButton />}

                        <ModeToggle />

                        <Burger
                            opened={opened}
                            onClick={toggle}
                            hiddenFrom="sm"
                            size="sm"
                        />
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar py="md" px={4}>
                <NavLinks />
            </AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>

            <AppShell.Footer></AppShell.Footer>
        </AppShell>
    );
}
