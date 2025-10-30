"use client";

import { AuthenticationModal } from "@/components/auth/auth-modal";
import { LogoutButton } from "@/components/auth/logout-btn";
import { OpenAuthenticationModalButton } from "@/components/auth/open-auth-modal-btn";
import { ModeToggle } from "@/components/shell/mode-toggle";
import { AltNavLinks, NavLinks } from "@/components/shell/navlinks";
import { SearchSpotlight } from "@/components/shell/search-spotlight";
import publicStyles from "@/styles/public.module.css";
import shellStyles from "@/styles/shell.module.css";
import { AppShell, Burger, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import cx from "clsx";
import { useRouter } from "next/navigation";

import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { useCentralizedAuth } from "@/lib/auth/centralized-auth-context-provider";
import { OfflineIndicator } from "./offline-indicator";

export function Shell({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();

    const { sessionUser } = useCentralizedAuth();

    const [openedNavBar, { toggle: toggleNavbar }] = useDisclosure();

    const [openedAuthModal, { close: closeAuthModal, open: openAuthModal }] =
        useDisclosure(false);

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: "lg",
                collapsed: { desktop: true, mobile: !openedNavBar },
            }}
        >
            <AppShell.Header zIndex={900}>
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
                            publicStyles.noTapHighlight
                        )}
                    >
                        <Title order={3}>Achebestan</Title>

                        <svg
                            height={24}
                            width={24}
                            style={{
                                display: "inline",
                                backgroundColor: "ButtonFace",
                                color: "yellow",
                                backgroundImage: "url(/icon0.svg",
                            }}
                        >
                            <use xlinkHref="/icon0.svg" href="/icon0.svg" />
                        </svg>
                    </Group>

                    <Group
                        justify="space-around"
                        flex={1}
                        wrap="nowrap"
                        visibleFrom="lg"
                    >
                        <AltNavLinks session={sessionUser.data} />
                    </Group>

                    <Group gap={"xs"} justify="space-evenly" wrap="nowrap">
                        {!sessionUser.isPending && (
                            <OpenAuthenticationModalButton
                                openModal={openAuthModal}
                                disabled={openedAuthModal}
                                color={sessionUser.data ? "green" : "red"}
                            />
                        )}

                        <SearchSpotlight />

                        <ModeToggle size="md" visibleFrom="lg" />

                        <Burger
                            opened={openedNavBar}
                            onClick={() => toggleNavbar()}
                            hiddenFrom="lg"
                            size="sm"
                        />
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar py="md" px={4}>
                <NavLinks session={sessionUser.data} />

                <Group justify="space-between" mt={"auto"} mx={"sm"}>
                    <ModeToggle
                        size={"sm"}
                        label="mode toggle"
                        labelPosition="left"
                    />

                    {sessionUser.data && <LogoutButton size={"sm"} />}
                </Group>
            </AppShell.Navbar>

            <AppShell.Main pos={"relative"}>
                <OfflineIndicator />
                {children}
                <AuthenticationModal
                    opened={openedAuthModal}
                    close={closeAuthModal}
                />

                <PWAInstallPrompt />
            </AppShell.Main>

            <AppShell.Footer></AppShell.Footer>
        </AppShell>
    );
}
