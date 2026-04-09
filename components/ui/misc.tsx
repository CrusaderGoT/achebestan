import { ThemeIcon, ThemeIconProps } from "@mantine/core";
import { IconFeatherFilled } from "@tabler/icons-react";

export function AuthorIcon({ ...props }: ThemeIconProps) {
    return (
        <ThemeIcon
            size={"xs"}
            color="grape.5"
            radius={"xl"}
            variant="transparent"
            {...props}
        >
            <IconFeatherFilled />
        </ThemeIcon>
    );
}
