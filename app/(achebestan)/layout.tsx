import { Container } from "@mantine/core";

export default async function AchebestanLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <Container p={"xs"}>{children}</Container>;
}
