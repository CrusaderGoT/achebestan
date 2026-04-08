import { LoadingOverlay, LoadingOverlayProps, Text } from "@mantine/core";

export interface LoadingOverlayWithTextProps extends LoadingOverlayProps {
    text?: string;
}

export function LoadingOverlayWithText({
    text = "loading",
    ...props
}: LoadingOverlayWithTextProps) {
    return (
        <>
            <LoadingOverlay {...props} zIndex={10} />
            <LoadingOverlay
                {...props}
                loaderProps={{
                    children: <Text ta={"center"}>{text}</Text>,
                    mt: 100,
                }}
                zIndex={11}
            />
        </>
    );
}
