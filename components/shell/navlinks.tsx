"use client";

import { NavLink, UnstyledButton } from "@mantine/core";
import {
    Icon,
    IconBook,
    IconCoffee,
    IconMail,
    IconMoneybagPlus,
    IconPlus,
    IconWriting,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";

import shellStyles from "@/styles/shell/shell.module.css";
import { useDisclosure } from "@mantine/hooks";
import cx from "clsx";
import { Fragment } from "react";
import { NavigationLink } from "../ui/route-navigation-progress";
import { KofiIframe } from "./kofi-iframe";

type NavLinkData = {
    icon: Icon;
    label: string;
    href: string;
    description?: string;
    rightSection?: React.JSX.Element;
    requiresCheck?: string;
    redirect?: boolean;
};

const baseNavlinkData: NavLinkData[] = [
    {
        icon: IconWriting,
        label: "New Story",
        href: "/story/new",
        description: "Write a new story",
        rightSection: <IconPlus size={16} stroke={1.5} />,
        requiresCheck: "canCreateStory" as const,
    },
    {
        icon: IconBook,
        label: "Books",
        href: "/books",
        description: "Collection of stories into books",
    },
    {
        icon: IconMail,
        label: "Contact",
        description: "Business inquiries or fan mail welcome",
        href: "mailto:enememeka44@gmail.com",
        redirect: true,
    },
    {
        icon: IconCoffee,
        label: "Buy Me Coffe",
        description: "Support me",
        href: "kofi",
        rightSection: <IconMoneybagPlus size={16} stroke={1.5} />,
    },
];

type NavLinkProps = {
    canCreateStory: boolean;
    closeNavbar?: () => void;
};

export function NavLinks({ canCreateStory, closeNavbar }: NavLinkProps) {
    const pathname = usePathname();
    const [openedKofiIframe, { open: openKofiIframe, close: closeKofiIframe }] =
        useDisclosure(false);

    const items = baseNavlinkData.map((item, index) => {
        // Hide "New Story" if user cannot create stories
        if (item.requiresCheck === "canCreateStory" && !canCreateStory) {
            return null;
        }

        if (item.href === "kofi") {
            return (
                <Fragment key={`${item.label}-${index}`}>
                    <NavLink
                        href={"#"}
                        active={openedKofiIframe}
                        label={item.label}
                        description={item.description}
                        rightSection={item.rightSection}
                        leftSection={<item.icon size={16} stroke={1.5} />}
                        onClick={() => {
                            openKofiIframe();

                            if (closeNavbar) {
                                closeNavbar();
                            }
                        }}
                    />

                    <KofiIframe
                        opened={openedKofiIframe}
                        close={closeKofiIframe}
                    />
                </Fragment>
            );
        }

        return (
            <NavLink
                href={item.href}
                key={`${item.label}-${index}`}
                active={pathname === item.href}
                label={item.label}
                description={item.description}
                rightSection={item.rightSection}
                leftSection={<item.icon size={16} stroke={1.5} />}
                component={NavigationLink}
                onClick={() => {
                    if (closeNavbar) {
                        closeNavbar();
                    }
                }}
                target={item.redirect ? "_blank" : ""}
            />
        );
    });

    return <>{items}</>;
}

export function AltNavLinks({ canCreateStory }: NavLinkProps) {
    const pathname = usePathname();

    const [openedKofiIframe, { open: openKofiIframe, close: closeKofiIframe }] =
        useDisclosure(false);

    const items = baseNavlinkData.map((item, index) => {
        // Hide "New Story" if user cannot create stories
        if (item.requiresCheck === "canCreateStory" && !canCreateStory) {
            return null;
        }

        if (item.href === "kofi") {
            return (
                <Fragment key={`${item.label}-${index}`}>
                    <UnstyledButton
                        key={index}
                        className={cx(
                            shellStyles.mobileNavBar,
                            openedKofiIframe && shellStyles.mobileNavBarActive,
                        )}
                        onClick={() => {
                            openKofiIframe();
                        }}
                    >
                        {item.label}
                    </UnstyledButton>

                    <KofiIframe
                        opened={openedKofiIframe}
                        close={closeKofiIframe}
                    />
                </Fragment>
            );
        }

        return (
            <UnstyledButton
                key={index}
                href={item.href}
                className={cx(
                    shellStyles.mobileNavBar,
                    pathname === item.href && shellStyles.mobileNavBarActive,
                )}
                component={NavigationLink}
            >
                {item.label}
            </UnstyledButton>
        );
    });

    return <>{items}</>;
}
