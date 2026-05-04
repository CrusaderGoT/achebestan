import classes from "@/styles/book/book-page.module.css";
import { BookAndStoriesType } from "@/types/books";
import { UserSelectType } from "@/types/user";
import { Container } from "@mantine/core";
import Link from "next/link";

function AuthorAvatar({ author }: { author: UserSelectType }) {
    const initials = author.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className={classes.authorAvatar}>
            {author.image ? (
                <img src={author.image} alt={author.name} />
            ) : (
                initials
            )}
        </div>
    );
}

function ChapterRow({
    story,
    index,
}: {
    story: BookAndStoriesType["stories"][0];
    index: number;
}) {
    return (
        <Link
            href={`/stories/${story.isbn}`}
            className={classes.chapterRow}
            style={{ animationDelay: `${0.05 + index * 0.07}s` }}
        >
            {/* Part number */}
            <span className={classes.chapterPartNum}>
                {String(story.bookPart).padStart(2, "0")}
            </span>

            {/* Title / subtitle / blurb */}
            <div className={classes.chapterMeta}>
                <h3 className={classes.chapterTitle}>{story.title}</h3>
                {story.subtitle && (
                    <p className={classes.chapterSubtitle}>{story.subtitle}</p>
                )}
                {story.blurb && (
                    <p className={classes.chapterBlurb}>{story.blurb}</p>
                )}
            </div>

            {/* Thumbnail + arrow */}
            <div className={classes.chapterRight}>
                {story.image && (
                    <img
                        src={story.image}
                        alt={story.title}
                        className={classes.chapterThumb}
                    />
                )}
                <span className={classes.chapterArrow}>→</span>
            </div>
        </Link>
    );
}

export function BookPage({ author, stories, ...book }: BookAndStoriesType) {
    // Split book name for italic accent on last word
    const nameParts = book.name.trim().split(" ");
    const nameStart = nameParts.slice(0, -1).join(" ");
    const nameLast = nameParts[nameParts.length - 1];

    const publishYear = new Date(book.created).getFullYear();

    return (
        <div className={classes.page}>
            {/* ── Dark header ─────────────────────────────── */}
            <header className={classes.header}>
                <Container size="md">
                    <div className={classes.headerInner}>
                        <p className={classes.headerEyebrow}>Book</p>

                        <h1 className={classes.bookTitle}>
                            {nameStart && <>{nameStart} </>}
                            <span className={classes.bookTitleAccent}>
                                {nameLast}
                            </span>
                        </h1>

                        {/* Author */}
                        <div className={classes.authorRow}>
                            <AuthorAvatar author={author} />
                            <div className={classes.authorInfo}>
                                <span className={classes.authorLabel}>
                                    Written by
                                </span>
                                <Link
                                    href={`/users/${book.authorId}`}
                                    className={classes.authorName}
                                    style={{ textDecoration: "none" }}
                                >
                                    {author.name}
                                </Link>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className={classes.headerMeta}>
                            <div className={classes.metaItem}>
                                <span className={classes.metaValue}>
                                    {stories.length}
                                </span>
                                <span className={classes.metaKey}>
                                    {stories.length === 1 ? "Story" : "Stories"}
                                </span>
                            </div>
                            <div className={classes.metaSep} />
                            <div className={classes.metaItem}>
                                <span className={classes.metaValue}>
                                    {publishYear}
                                </span>
                                <span className={classes.metaKey}>
                                    Published
                                </span>
                            </div>
                        </div>
                    </div>
                </Container>
            </header>

            {/* ── Chapter list ────────────────────────────── */}
            <section className={classes.chapterSection}>
                <Container size="md">
                    <div className={classes.chapterHeader}>
                        <h2 className={classes.chapterHeading}>Contents</h2>
                        <div className={classes.chapterRule} />
                    </div>

                    {stories.length === 0 ? (
                        <div className={classes.empty}>
                            <span className={classes.emptyGlyph}>✦</span>
                            <p className={classes.emptyText}>
                                No stories published yet
                            </p>
                        </div>
                    ) : (
                        stories.map((story, index) => (
                            <ChapterRow
                                key={story.isbn}
                                story={story}
                                index={index}
                            />
                        ))
                    )}
                </Container>
            </section>
        </div>
    );
}
