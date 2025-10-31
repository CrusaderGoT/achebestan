

import {
    Switch,
    SwitchProps,
    useComputedColorScheme,
    useMantineColorScheme
} from "@mantine/core";
import { useIsomorphicEffect } from "@mantine/hooks";
import { IconMoonStars, IconSun } from "@tabler/icons-react";
import { useState } from "react";

type ModeToggleProps = SwitchProps;

export function ModeToggle({ ...props }: ModeToggleProps) {
    const { setColorScheme } = useMantineColorScheme();

    const computedColorScheme = useComputedColorScheme("light", {
        getInitialValueInEffect: true,
    });

    const [checkedModeToggle, setCheckedModeToggle] = useState(false);

    // for correct switch mode on page load
    useIsomorphicEffect(() => {
        setCheckedModeToggle(computedColorScheme !== "dark");
    }, [computedColorScheme, setCheckedModeToggle]);

    return (
        <Switch
            checked={checkedModeToggle}
            onChange={(event) =>
                setCheckedModeToggle(event.currentTarget.checked)
            }
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
