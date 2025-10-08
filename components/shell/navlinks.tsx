"use client";

import { authClient } from "@/lib/auth-client";
import { NavLink, UnstyledButton } from "@mantine/core";
import {
    IconBook,
    IconCoffee,
    IconMail,
    IconMoneybagPlus,
    IconPlus,
    IconWriting,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";

import publicStyles from "@/styles/public.module.css";
import shellStyles from "@/styles/shell.module.css";
import cx from "clsx";
import { NavigationLink } from "../ui/route-navigation-progress";

export const navlinkData = [
    {
        icon: IconWriting,
        label: "New Story",
        href: "/story/new",
        description: "Write a new story",
        rightSection: <IconPlus size={16} stroke={1.5} />,
        auth: true,
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
        href: "/#",
    },
    {
        icon: IconCoffee,
        label: "Buy Me Coffe",
        description: "Support me",
        href: "/#",
        rightSection: <IconMoneybagPlus size={16} stroke={1.5} />,
    },
];

export function NavLinks({
    session,
}: {
    session: ReturnType<typeof authClient.useSession>["data"];
}) {
    const pathname = usePathname();

    const items = navlinkData.map((item, index) => {
        // do not show nav that require auth or role

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
                className={cx(
                    item.auth && !session?.user.id && publicStyles.hide
                )}
            />
        );
    });

    return items;
}

export function AltNavLinks({
    session,
}: {
    session?: ReturnType<typeof authClient.useSession>["data"];
}) {
    const pathname = usePathname();

    const items = navlinkData.map((item, index) => {
        // do not show nwv that require auth or role
        return (
            <UnstyledButton
                key={index}
                href={item.href}
                className={cx(
                    shellStyles.mobileNavBar,
                    pathname === item.href && shellStyles.mobileNavBarActive,
                    item.auth && !session?.user.id && publicStyles.hide
                )}
                component={NavigationLink}
            >
                {item.label}
            </UnstyledButton>
        );
    });

    return items;
}
