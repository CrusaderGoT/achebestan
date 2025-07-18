"use client";

import styles from "@/styles/book.module.css";
import {
    Box,
    Button,
    Center,
    Image as MantineImage,
    Stack,
    Text,
} from "@mantine/core";

interface BookProps {
    image: string;
    title: string;
    subtitle: string;
    alt?: string;
    author?: string;
    isbn?: string;
    navigate?: boolean;
}

function Book({
    image,
    title,
    subtitle,
    alt,
    author,
    isbn,
    navigate = true,
}: BookProps) {
    return (
        <Stack className={styles.bookContainer}>
            <Box className={styles.book}>
                <Box className={styles.bookSpine} />
                <Box className={styles.bookCover}>
                    <MantineImage
                        src={image}
                        alt={alt || title}
                        className={styles.bookImage}
                    />
                    <Box className={styles.bookText}>
                        <Text className={styles.bookTitle}>{title}</Text>
                        <Text className={styles.bookSubtitle}>{subtitle}</Text>
                        {author && (
                            <Text className={styles.bookAuthor}>{author}</Text>
                        )}
                        {isbn && (
                            <Text className={styles.isbn}>ISBN: {isbn}</Text>
                        )}
                    </Box>
                </Box>
            </Box>
            {navigate && (
                <Center>
                    <Text className={styles.title}>{title}</Text>

                    <Button variant="outline" className={styles.navigate}>
                        Goto
                    </Button>
                </Center>
            )}
        </Stack>
    );
}

export default Book;
