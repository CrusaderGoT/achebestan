"use client";

import { NavLink } from "@mantine/core";
import {
    IconActivity,
    IconChevronRight,
    IconFingerprint,
    IconGauge,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const navlinkData = [
    {
        icon: IconGauge,
        label: "Dashboard",
        description: "Item with description",
        href: "/",
    },
    {
        icon: IconFingerprint,
        label: "Security",
        rightSection: <IconChevronRight size={16} stroke={1.5} />,
        href: "/random",
    },
    { icon: IconActivity, label: "Activity", href: "/search" },
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
