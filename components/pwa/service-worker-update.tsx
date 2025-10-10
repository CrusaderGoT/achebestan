"use client";

import { useServiceWorker } from "@/lib/hooks/pwa/use-service-worker";

// Component to show update notification
export function ServiceWorkerUpdate() {
    const { updateAvailable, updateServiceWorker } = useServiceWorker();

    if (!updateAvailable) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
            <p className="mb-2">A new version is available!</p>
            <button
                onClick={updateServiceWorker}
                className="bg-white text-blue-600 px-4 py-2 rounded"
            >
                Update Now
            </button>
        </div>
    );
}
