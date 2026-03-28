"use client";

import { authClient } from "@/lib/auth-client";
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

import { canCreateStory } from "@/lib/auth/policies";
import shellStyles from "@/styles/shell.module.css";
import cx from "clsx";
import { useEffect, useState } from "react";
import { NavigationLink } from "../ui/route-navigation-progress";

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
        href: "/#",
    },
    {
        icon: IconCoffee,
        label: "Buy Me Coffe",
        description: "Support me",
        href: "https://ko-fi.com/achebestan",
        rightSection: <IconMoneybagPlus size={16} stroke={1.5} />,
        redirect: true,
    },
];

type NavLinkProps = {
    session: ReturnType<typeof authClient.useSession>["data"];
    closeNavbar?: () => void;
};

export function NavLinks({ session, closeNavbar }: NavLinkProps) {
    const pathname = usePathname();
    const [canCreate, setCanCreate] = useState<boolean | null>(null);

    useEffect(() => {
        const checkPermissions = async () => {
            const result = await canCreateStory();
            setCanCreate(result);
        };
        checkPermissions();
    }, [session?.user?.id]);

    const items = baseNavlinkData.map((item, index) => {
        // Hide "New Story" if user cannot create stories
        if (item.requiresCheck === "canCreateStory" && !canCreate) {
            return null;
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

export function AltNavLinks({ session }: NavLinkProps) {
    const pathname = usePathname();
    const [canCreate, setCanCreate] = useState<boolean | null>(null);

    useEffect(() => {
        const checkPermissions = async () => {
            const result = await canCreateStory();
            setCanCreate(result);
        };
        checkPermissions();
    }, [session?.user?.id]);

    const items = baseNavlinkData.map((item, index) => {
        // Hide "New Story" if user cannot create stories
        if (item.requiresCheck === "canCreateStory" && !canCreate) {
            return null;
        }

        return (
            <UnstyledButton
                key={index}
                href={item.href}
                className={cx(
                    shellStyles.mobileNavBar,
                    pathname === item.href && shellStyles.mobileNavBarActive
                )}
                component={NavigationLink}
            >
                {item.label}
            </UnstyledButton>
        );
    });

    return <>{items}</>;
}
