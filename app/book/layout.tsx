import { Container } from "@mantine/core";

export default function BookLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <Container p={"xl"}> {children}</Container>;
}
