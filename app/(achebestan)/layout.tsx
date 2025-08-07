import { readLatestStories } from "@/lib/actions/story";
import { Container } from "@mantine/core";

export default function StoryLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <Container p={"xs"}>{children}</Container>;
}

export async function generateStaticParams() {
    const stories = await readLatestStories(10);
    // params to prefetch story across child route, when needed
    return (
        stories?.map((story) => ({
            isbn: story.isbn,
        })) || []
    );
}
