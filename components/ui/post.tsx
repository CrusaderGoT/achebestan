"use client";

import {
    Avatar,
    Badge,
    Box,
    Card,
    Code,
    Group,
    Image,
    ScrollArea,
    Text,
    Title,
} from "@mantine/core";
import { IconUserCircle } from "@tabler/icons-react";

import styles from "@/styles/post.module.css";

interface PostProps {
    image?: string;
    author: string;
    title: string;
    content: string;
    created: Date;
    edited?: Date;
}

function Post({ image, author, title, content, created, edited }: PostProps) {
    return (
        <Card className={styles.postCard} withBorder>
            <Card.Section className={styles.postImageSection}>
                <Image src={image} alt={title} className={styles.postImage} />

                <Box className={styles.postBadgeTime}>
                    <Badge
                        leftSection={
                            <Avatar src={null} size={20} variant="filled">
                                <IconUserCircle />
                            </Avatar>
                        }
                    >
                        {author}
                    </Badge>

                    <Group>
                        <Code>created: {created.toLocaleTimeString()}</Code>
                        {edited && (
                            <Code>
                                last edited: {edited.toLocaleTimeString()}
                            </Code>
                        )}
                    </Group>
                </Box>
            </Card.Section>

            <Title>{title}</Title>

            <ScrollArea>
                <Text>{content}</Text>
            </ScrollArea>
        </Card>
    );
}

export default Post;
