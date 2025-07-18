import { Box, Image as MantineImage, Text } from "@mantine/core";
import styles from "@/styles/book3d.module.css";

interface BookProps {
    cover: string;
    title: string;
    subtitle: string;
    alt?: string;
    author?: string;
    isbn?: string;
    colorScheme?: "light" | "dark";
}

export function Book3D({ cover, title, subtitle, author, isbn }: BookProps) {
    return (
        <Box className={styles.container}>
            <Box className={styles.book}>
                <MantineImage
                    src={cover}
                    alt={title}
                    className={styles.cover}
                />
                <div className={styles.spine}>
                    <Text
                        className={styles.spineText}
                        style={{ writingMode: "vertical-rl" }}
                    >
                        {title}
                    </Text>
                </div>
            </Box>
            <Box className={styles.info}>
                <Text fw={700}>{title}</Text>
                {subtitle && <Text fs={"italic"}>{subtitle}</Text>}
                <Text>{author}</Text>
                <Text size="xs" c="dimmed">
                    ISBN: {isbn}
                </Text>
            </Box>
        </Box>
    );
}
