// Book.tsx
import { Box, Image as MantineImage, Text } from "@mantine/core";
import styles from "@/styles/book.module.css";

interface BookProps {
    image: string;
    title: string;
    subtitle: string;
    alt?: string;
    author?: string;
    isbn?: string;
    colorScheme?: "light" | "dark";
}

export function Book({
    image,
    title,
    subtitle,
    alt,
    author,
    isbn,
    colorScheme,
}: BookProps) {
    return (
        <Box className={styles.bookContainer} data-color-scheme={colorScheme}>
            <Box className={styles.book}>
                {/* Book spine should be a sibling to book cover */}
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
        </Box>
    );
}

export default Book;
