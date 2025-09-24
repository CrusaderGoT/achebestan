"use client";

import {
    Switch,
    SwitchProps,
    useComputedColorScheme,
    useMantineColorScheme,
} from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";

type ModeToggleProps = {
    checked: boolean;
    setChecked: Dispatch<SetStateAction<boolean>>;
} & SwitchProps;

export function ModeToggle({ checked, setChecked, ...props }: ModeToggleProps) {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme("light", {
        getInitialValueInEffect: true,
    });

    return (
        <Switch
            checked={checked}
            onChange={(event) => setChecked(event.currentTarget.checked)}
            onClick={() =>
                setColorScheme(
                    computedColorScheme === "light" ? "dark" : "light"
                )
            }
            color="dark"
            onLabel={
                <IconSun
                    size={16}
                    stroke={2.5}
                    color="var(--mantine-color-yellow-6)"
                />
            }
            offLabel={
                <IconMoonStars
                    size={16}
                    stroke={2.5}
                    color="var(--mantine-color-blue-6)"
                />
            }
            {...props}
        />
    );
}
