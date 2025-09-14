"use client";

import { NavLink } from "@mantine/core";
import {
    IconBook,
    IconCoffee,
    IconMail,
    IconMoneybagPlus,
    IconPlus,
    IconWriting,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const navlinkData = [
    {
        icon: IconWriting,
        label: "New Story",
        href: "/story/new",
        description: "Write a new story",
        rightSection: <IconPlus size={16} stroke={1.5} />,
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

export function NavLinks() {
    const pathname = usePathname();

    const items = navlinkData.map((item, index) => (
        <NavLink
            href={item.href}
            key={`${item.label}-${index}`}
            active={pathname === item.href}
            label={item.label}
            description={item.description}
            rightSection={item.rightSection}
            leftSection={<item.icon size={16} stroke={1.5} />}
            component={Link}
        />
    ));

    return items;
}
