"use client";

import { LoginButton } from "@/components/buttons/login-btn";
import { LogoutButton } from "@/components/buttons/logout-btn";
import { ModeToggle } from "@/components/buttons/mode-toggle";
import { LoginModal } from "@/components/forms/user/auth-modal";
import { ActivateAuth } from "@/components/shell/activate-auth";
import { navlinkData, NavLinks } from "@/components/shell/navlinks";
import { SearchSpotlight } from "@/components/shell/search-spotlight";
import { authClient } from "@/lib/auth-client";
import publicStyles from "@/styles/public.module.css";
import shellStyles from "@/styles/shell.module.css";
import {
    AppShell,
    Burger,
    Group,
    Image,
    Title,
    UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import cx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function Shell({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();

    const pathname = usePathname();

    const [secretValue, setSecretValue] = useState<string>("");

    const { data: session } = authClient.useSession();

    const [openedNavBar, { toggle: toggleNavbar }] = useDisclosure();

    const [openedLoginModal, { close: closeLoginModal, open: openLoginModal }] =
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
                <Group className={shellStyles.headerGroup} flex={1} gap={"xl"}>
                    <Group
                        align="center"
                        wrap="nowrap"
                        gap={5}
                        onClick={() => router.push("/")}
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
                            }}
                        >
                            <use xlinkHref="/achebestan_logo.svg"></use>
                        </svg>
                    </Group>

                    <Group justify="space-around" visibleFrom="lg" flex={1}>
                        {navlinkData.map((item, index) => (
                            <UnstyledButton
                                key={index}
                                component={Link}
                                href={item.href}
                                className={cx(
                                    shellStyles.mobileNavBar,
                                    pathname === item.href &&
                                        shellStyles.mobileNavBarActive
                                )}
                            >
                                {item.label}
                            </UnstyledButton>
                        ))}

                        {!session?.user.id && (
                            <ActivateAuth
                                secretValue={secretValue}
                                setSecretValue={setSecretValue}
                            />
                        )}
                    </Group>

                    <Group gap={"xs"}>
                        {session?.user.id ? (
                            <LogoutButton />
                        ) : (
                            secretValue.trim().toLowerCase() === "logmein" && (
                                <LoginButton
                                    openLoginModal={openLoginModal}
                                    disabled={openedLoginModal}
                                />
                            )
                        )}

                        <SearchSpotlight />

                        <ModeToggle />

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
                <NavLinks />

                {!session?.user.id && (
                    <ActivateAuth
                        secretValue={secretValue}
                        setSecretValue={setSecretValue}
                    />
                )}
            </AppShell.Navbar>

            <AppShell.Main pos={"relative"}>
                {children}
                <LoginModal opened={openedLoginModal} close={closeLoginModal} />
            </AppShell.Main>

            <AppShell.Footer></AppShell.Footer>
        </AppShell>
    );
}
