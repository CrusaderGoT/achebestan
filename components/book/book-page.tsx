import classes from "@/styles/book/book-page.module.css";
import { BookAndStoriesType } from "@/types/books";
import { Avatar, Badge, Container } from "@mantine/core";
import { IconArrowRight, IconBook, IconCalendar } from "@tabler/icons-react";
import Link from "next/link";

function StoryRow({
    story,
    index,
}: {
    story: BookAndStoriesType["stories"][0];
    index: number;
}) {
    const partNumber = story.bookPart ?? index + 1;

    return (
        <Link
            href={`/stories/${story.isbn}`}
            className={classes.storyRow}
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
        >
            <div className={classes.storyNumber}>
                <span className={classes.numberLabel}>Part</span>
                <span className={classes.numberValue}>
                    {String(partNumber).padStart(2, "0")}
                </span>
            </div>

            <div className={classes.storyContent}>
                <h3 className={classes.storyTitle}>{story.title}</h3>
                {story.subtitle && (
                    <p className={classes.storySubtitle}>{story.subtitle}</p>
                )}
                {story.blurb && (
                    <p className={classes.storyBlurb}>{story.blurb}</p>
                )}
            </div>

            <div className={classes.storyArrow}>
                <IconArrowRight size={20} stroke={1.5} />
            </div>
        </Link>
    );
}

export function BookPage({ author, stories, ...book }: BookAndStoriesType) {
    const publishDate = new Date(book.created);
    const publishYear = publishDate.getFullYear();
    const publishMonth = publishDate.toLocaleDateString("en-US", {
        month: "short",
    });

    const initials = author.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className={classes.page}>
            {/* Hero Section */}
            <header className={classes.hero}>
                <Container size="lg" className={classes.heroContainer}>
                    {/* Breadcrumb / Eyebrow */}
                    <div className={classes.eyebrow}>
                        <Link href="/" className={classes.eyebrowLink}>
                            Home
                        </Link>
                        <span className={classes.eyebrowSep}>/</span>
                        <Link href="/books" className={classes.eyebrowLink}>
                            Books
                        </Link>
                    </div>

                    {/* Large Title Treatment */}
                    <div className={classes.titleSection}>
                        <Badge
                            variant="outline"
                            color="gray"
                            size="sm"
                            className={classes.badge}
                        >
                            Collection
                        </Badge>
                        <h1 className={classes.title}>{book.name}</h1>
                    </div>

                    {/* Author + Meta Row */}
                    <div className={classes.metaRow}>
                        <Link
                            href={`/users/${book.authorId}`}
                            className={classes.authorLink}
                        >
                            <Avatar
                                src={author.image}
                                alt={author.name}
                                size={40}
                                radius="xl"
                                color="gray"
                            >
                                {initials}
                            </Avatar>
                            <div className={classes.authorInfo}>
                                <span className={classes.authorLabel}>
                                    Written by
                                </span>
                                <span className={classes.authorName}>
                                    {author.name}
                                </span>
                            </div>
                        </Link>

                        <div className={classes.metaDivider} />

                        <div className={classes.metaStats}>
                            <div className={classes.metaStat}>
                                <IconBook
                                    size={16}
                                    stroke={1.5}
                                    className={classes.metaIcon}
                                />
                                <span className={classes.metaValue}>
                                    {stories.length}
                                </span>
                                <span className={classes.metaLabel}>
                                    {stories.length === 1 ? "Story" : "Stories"}
                                </span>
                            </div>
                            <div className={classes.metaStat}>
                                <IconCalendar
                                    size={16}
                                    stroke={1.5}
                                    className={classes.metaIcon}
                                />
                                <span className={classes.metaValue}>
                                    {publishMonth}
                                </span>
                                <span className={classes.metaLabel}>
                                    {publishYear}
                                </span>
                            </div>
                        </div>
                    </div>
                </Container>
            </header>

            {/* Stories Section */}
            <section className={classes.storiesSection}>
                <Container size="lg">
                    <div className={classes.sectionHeader}>
                        <h2 className={classes.sectionTitle}>Contents</h2>
                        <div className={classes.sectionLine} />
                        <span className={classes.sectionCount}>
                            {stories.length}{" "}
                            {stories.length === 1 ? "chapter" : "chapters"}
                        </span>
                    </div>

                    {stories.length === 0 ? (
                        <div className={classes.empty}>
                            <div className={classes.emptyIcon}>
                                <IconBook size={48} stroke={1} />
                            </div>
                            <p className={classes.emptyText}>
                                No stories published yet
                            </p>
                            <p className={classes.emptyHint}>
                                Check back soon for new content
                            </p>
                        </div>
                    ) : (
                        <div className={classes.storiesList}>
                            {stories.map((story, index) => (
                                <StoryRow
                                    key={story.isbn}
                                    story={story}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </Container>
            </section>

            {/* Footer */}
            <footer className={classes.footer}>
                <Container size="lg">
                    <div className={classes.footerContent}>
                        <Link
                            href={`/users/${book.authorId}`}
                            className={classes.footerLink}
                        >
                            View all books by {author.name}
                            <IconArrowRight size={16} stroke={1.5} />
                        </Link>
                    </div>
                </Container>
            </footer>
        </div>
    );
}
