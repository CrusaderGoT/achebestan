import Post from "@/components/ui/post";
import { Group, Stack } from "@mantine/core";
import {
    IconBubble,
    IconCurrencyDollar,
    IconHeart,
    IconShare2,
} from "@tabler/icons-react";

export default function BookPage() {
    return (
        <Stack>
            <Post
                image="/images/demo.jpg"
                title="The Sleepwalkers"
                author="Achebestan"
                content="a bunch of bullshit"
                created={new Date()}
                edited={new Date()}
            />

            <Group>
                <IconHeart />
                <IconBubble />
                <IconCurrencyDollar />
                <IconShare2 />
            </Group>
        </Stack>
    );
}
