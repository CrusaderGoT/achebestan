import { Container } from "@mantine/core";

export default function StoryLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <Container p={"xl"}> {children}</Container>;
}
