"use client";

import { AuthenticationModal } from "@/components/forms/user/auth-modal";
import { ModeToggle } from "@/components/shell/mode-toggle";
import { AltNavLinks, NavLinks } from "@/components/shell/navlinks";
import { SearchSpotlight } from "@/components/shell/search-spotlight";
import { LogoutButton } from "@/components/user/logout-btn";
import { OpenAuthenticationModalButton } from "@/components/user/open-auth-modal-btn";
import { authClient } from "@/lib/auth-client";
import publicStyles from "@/styles/public.module.css";
import shellStyles from "@/styles/shell.module.css";
import { AppShell, Burger, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import cx from "clsx";
import { useRouter } from "next/navigation";

import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";

export function Shell({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();

    const { data: session, isPending: isPendingSession } =
        authClient.useSession();

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
                        <AltNavLinks session={session} />
                    </Group>

                    <Group gap={"xs"} justify="space-evenly" wrap="nowrap">
                        {session?.user.id ? (
                            session.user.isAnonymous ? (
                                <OpenAuthenticationModalButton
                                    openModal={openAuthModal}
                                    disabled={openedAuthModal}
                                />
                            ) : (
                                <LogoutButton />
                            )
                        ) : isPendingSession ? null : (
                            <OpenAuthenticationModalButton
                                openModal={openAuthModal}
                                disabled={openedAuthModal}
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
                <NavLinks session={session} />

                <Group ml={"auto"} mt={"xs"} mr={"sm"}>
                    <ModeToggle
                        size={"sm"}
                        label="mode toggle"
                        labelPosition="left"
                    />
                </Group>
            </AppShell.Navbar>

            <AppShell.Main pos={"relative"}>
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
