

import { Button, Stack, Text, Title } from "@mantine/core";
//import type { Metadata } from "next";

//export const metadata: Metadata = {
//    title: "Offline",
//};

export default function OfflinePage() {
    return (
        <Stack justify="center" align="center">
            <Title order={1} fw={"bold"}>
                You&apos;re Offline
            </Title>

            <Text c={"dimmed"}>Please check your internet connection</Text>

            <Button c={"white"} onClick={() => window.location.reload()}>
                Retry
            </Button>
        </Stack>
    );
}
