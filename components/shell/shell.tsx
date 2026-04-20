"use client";

import { AuthenticationDrawer } from "@/components/auth/auth-drawer";
import { LogoutButton } from "@/components/auth/logout-btn";
import { OpenAuthenticationModalButton } from "@/components/auth/open-auth-modal-btn";
import { ModeToggle } from "@/components/shell/mode-toggle";
import { AltNavLinks, NavLinks } from "@/components/shell/navlinks";
import { SearchSpotlight } from "@/components/shell/search-spotlight";
import publicStyles from "@/styles/public.module.css";
import shellStyles from "@/styles/shell/shell.module.css";
import { AppShell, Burger, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import cx from "clsx";
import { useRouter } from "next/navigation";

import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { canCreateStory } from "@/lib/auth/policies/story-policy";
import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { useEffect, useState } from "react";
import { OfflineIndicator } from "./offline-indicator";

export function Shell({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();

    const { sessionUser } = useCentralizedAuth();

    const [openedNavBar, { toggle: toggleNavbar, close: closeNavbar }] =
        useDisclosure();

    const [openedAuthModal, { close: closeAuthModal, open: openAuthModal }] =
        useDisclosure(false);

    const [canCreate, setCanCreate] = useState<boolean>(false);

    useEffect(() => {
        if (sessionUser.isPending) return;

        const checkPermissions = async () => {
            const result = await canCreateStory();
            setCanCreate(result);
        };
        checkPermissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionUser.data?.user.id]);

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: "lg",
                collapsed: { desktop: true, mobile: !openedNavBar },
            }}
        >
            <AppShell.Header>
                <Group
                    className={shellStyles.headerGroup}
                    flex={1}
                    wrap="nowrap"
                >
                    <Group
                        align="center"
                        wrap="nowrap"
                        gap={5}
                        onClick={() => router.replace("/")}
                        className={cx(
                            shellStyles.websiteName,
                            publicStyles.noTapHighlight,
                        )}
                    >
                        <Title order={3}>Achebestan</Title>
                    </Group>

                    <Group
                        justify="space-around"
                        flex={1}
                        wrap="nowrap"
                        visibleFrom="lg"
                    >
                        {!sessionUser.isPending && (
                            <AltNavLinks canCreateStory={canCreate} />
                        )}
                    </Group>

                    <Group gap={"xs"} justify="space-evenly" wrap="nowrap">
                        <OpenAuthenticationModalButton
                            openModal={openAuthModal}
                            disabled={openedAuthModal}
                            session={sessionUser}
                        />

                        <SearchSpotlight />

                        <ModeToggle size="md" visibleFrom="lg" />

                        <Burger
                            opened={openedNavBar}
                            onClick={toggleNavbar}
                            hiddenFrom="lg"
                            size="sm"
                        />

                        <LogoutButton
                            visibleFrom="lg"
                            size={"sm"}
                            session={sessionUser}
                        />
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar py="md" px={4}>
                {!sessionUser.isPending && (
                    <NavLinks
                        closeNavbar={closeNavbar}
                        canCreateStory={canCreate}
                    />
                )}

                <Group justify="space-between" mt={"auto"} mx={"sm"}>
                    <ModeToggle
                        size={"sm"}
                        label="mode toggle"
                        labelPosition="left"
                    />

                    <LogoutButton size={"sm"} session={sessionUser} />
                </Group>
            </AppShell.Navbar>

            <AppShell.Main pos={"relative"}>
                <OfflineIndicator />
                {children}
                <AuthenticationDrawer
                    opened={openedAuthModal}
                    close={closeAuthModal}
                />

                <PWAInstallPrompt />
            </AppShell.Main>

            <AppShell.Footer></AppShell.Footer>
        </AppShell>
    );
}
