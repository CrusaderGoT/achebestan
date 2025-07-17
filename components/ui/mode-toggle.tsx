"use client";

import {
    ActionIcon,
    useComputedColorScheme,
    useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import cx from "clsx";
import styles from "@/styles/mode-toggle.module.css";

export function ModeToggle() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme("light", {
        getInitialValueInEffect: true,
    });

    return (
        <ActionIcon
            onClick={() =>
                setColorScheme(
                    computedColorScheme === "light" ? "dark" : "light"
                )
            }
            variant="default"
            size="xl"
            aria-label="Toggle color scheme"
        >
            <IconSun className={cx(styles.icon, styles.light)} stroke={1.5} />
            <IconMoon className={cx(styles.icon, styles.dark)} stroke={1.5} />
        </ActionIcon>
    );
}
