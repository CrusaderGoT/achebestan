"use client";

import { Button, Center, Flex, Text, Title } from "@mantine/core";
//import type { Metadata } from "next";

//export const metadata: Metadata = {
//    title: "Offline",
//};

export default function OfflinePage() {
    return (
        <Flex className="min-h-screen flex items-center justify-center">
            <Center className="text-center">
                <Title order={1} className="text-4xl font-bold mb-4">
                    You&apos;re Offline
                </Title>
                <Text className="text-gray-600 mb-4">
                    Please check your internet connection
                </Text>
                <Button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-6 py-2 rounded"
                >
                    Retry
                </Button>
            </Center>
        </Flex>
    );
}
