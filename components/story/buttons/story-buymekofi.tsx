import { KofiIframe } from "@/components/shell/kofi-iframe";
import { ActionIcon, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCurrencyDollar } from "@tabler/icons-react";

export function StoryBuyMeKofi() {
    const [opened, { close, toggle }] = useDisclosure(false);
    return (
        <>
            <KofiIframe opened={opened} close={close} />

            <Tooltip label={"Buy me coffee"} withArrow position="top">
                <ActionIcon
                    onClick={toggle}
                    variant="transparent"
                    color="green"
                    size="lg"
                    radius="xl"
                    aria-label={"Support this story"}
                >
                    <IconCurrencyDollar size={24} stroke={1.5} />
                </ActionIcon>
            </Tooltip>
        </>
    );
}
