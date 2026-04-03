import { Container } from "@mantine/core";
import { Suspense } from "react";

export default async function AchebestanLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Container p={"xs"}>
            <Suspense fallback={null}>{children}</Suspense>
        </Container>
    );
}
