"use client";

import styles from "@/styles/book.module.css";
import cx from "clsx";

import {
    Box,
    Button,
    Center,
    Flex,
    Image as MantineImage,
    Stack,
    Text,
} from "@mantine/core";
import { useElementSize } from "@mantine/hooks";

interface BookProps {
    image: string;
    title: string;
    subtitle: string;
    alt?: string;
    author?: string;
    isbn?: string;
    navigate?: boolean;
    content: string
}

function Book({
    image,
    title,
    subtitle,
    alt,
    author,
    isbn,
    navigate = true,
    content
}: BookProps) {
    const { ref, width } = useElementSize();

    return (
        <Flex gap={"xs"}>
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
                            <Text className={styles.bookSubtitle}>
                                {subtitle}
                            </Text>
                            {author && (
                                <Text className={styles.bookAuthor}>
                                    {author}
                                </Text>
                            )}
                            {isbn && (
                                <Text className={styles.isbn}>
                                    ISBN: {isbn}
                                </Text>
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

            <Center
                ref={ref}
                className={cx(
                    width < 120 ? styles.hideParagraph : styles.showParagraph
                )}
            >
                <Text lineClamp={7} className={styles.bookParagraph}>
                    {content}
                </Text>
            </Center>
        </Flex>
    );
}

export default Book;
