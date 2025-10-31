

import { useServiceWorker } from "@/lib/hooks/pwa/use-service-worker";
import { Affix, Button, Text } from "@mantine/core";

// Component to show update notification
export function ServiceWorkerUpdate() {
    const { updateAvailable, updateServiceWorker } = useServiceWorker();

    if (!updateAvailable) return null;

    return (
        <Affix
            position={{ bottom: 4, right: 4 }}
            className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg"
        >
            <Text className="mb-2">A new version is available!</Text>
            <Button
                onClick={updateServiceWorker}
                className="bg-white text-blue-600 px-4 py-2 rounded"
            >
                Update Now
            </Button>
        </Affix>
    );
}
