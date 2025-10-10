import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Offline",
};

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">You&apos;re Offline</h1>
                <p className="text-gray-600 mb-4">
                    Please check your internet connection
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-6 py-2 rounded"
                >
                    Retry
                </button>
            </div>
        </div>
    );
}
