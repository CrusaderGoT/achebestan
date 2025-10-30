import { Affix, Alert, Center } from "@mantine/core";
import { useNetwork } from "@mantine/hooks";

export function OfflineIndicator() {
    const network = useNetwork();

    if (!network.online) {
        return null;
    }

    <Affix top={80} left={0} right={0}>
        <Center>
            <Alert>You Are Offline!</Alert>
        </Center>
    </Affix>;
}
