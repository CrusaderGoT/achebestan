"use client";

import styles from "@/styles/mode-toggle.module.css";
import {
    ActionIcon,
    useComputedColorScheme,
    useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import cx from "clsx";

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
            variant="light"
            size="lg"
            aria-label="Toggle color scheme"
            className={styles.actionIcon}
        >
            <IconSun className={cx(styles.icon, styles.light)} stroke={1.5} />
            <IconMoon className={cx(styles.icon, styles.dark)} stroke={1.5} />
        </ActionIcon>
    );
}
