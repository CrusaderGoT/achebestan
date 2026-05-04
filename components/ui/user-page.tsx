"use client";

import { getUserAndBooksWithStoryCount } from "@/lib/actions/user";
import classes from "@/styles/user-page.module.css";
import { Container, Grid } from "@mantine/core";
import Link from "next/link";

export type UserAndBooksWithStoryCountType = Awaited<
    ReturnType<typeof getUserAndBooksWithStoryCount>
>;

function UserAvatar({
    user,
}: {
    user: UserAndBooksWithStoryCountType["user"];
}) {
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className={classes.avatarWrap}>
            <div className={classes.avatarOuter}>
                {user.image ? (
                    <img src={user.image} alt={user.name} />
                ) : (
                    initials
                )}
            </div>
            {/* Online indicator — always shown for the user's own page */}
            <span className={classes.avatarStatus} />
        </div>
    );
}

function BookCard({
    index,
    ...bookData
}: {
    book: UserAndBooksWithStoryCountType["books"][0];
    index: number;
}) {
    const book = bookData.book.book;
    const storyCount = bookData.book.bookStoriesCount;

    const year = new Date(book.created).getFullYear();

    // Truncate name for the decorative background number
    const nameParts = book.name.trim().split(" ");
    const displayInitial = nameParts[0].charAt(0).toUpperCase();

    return (
        <Link
            href={`/books/${book.id}`}
            className={classes.bookCard}
            style={{ animationDelay: `${0.1 + index * 0.09}s` }}
        >
            {/* Decorative index */}
            <span className={classes.bookCardIndex}>
                {String(index + 1).padStart(2, "0")}
            </span>

            {/* Icon */}
            <div className={classes.bookCardIcon}>{displayInitial}</div>

            {/* Name */}
            <h3 className={classes.bookCardName}>{book.name}</h3>

            {/* Meta */}
            <div className={classes.bookCardMeta}>
                <span>
                    {storyCount} {storyCount === 1 ? "story" : "stories"}
                </span>
                <span className={classes.bookCardMetaSep} />
                <span>{year}</span>
            </div>

            {/* Footer */}
            <div className={classes.bookCardFooter}>
                <span className={classes.bookCardIsbn}>#{book.id}</span>
                <span className={classes.bookCardCta}>View book →</span>
            </div>
        </Link>
    );
}

// ── Page ──────────────────────────────────────────────────────

export function UserPage({ user, books }: UserAndBooksWithStoryCountType) {
    const joinYear = new Date(user.createdAt).getFullYear();

    // Split name: first + italic last word
    const nameParts = user.name.trim().split(" ");
    const firstName = nameParts.slice(0, -1).join(" ");
    const lastName = nameParts[nameParts.length - 1];

    return (
        <div className={classes.page}>
            {/* ── Hero ────────────────────────────────────── */}
            <section className={classes.hero}>
                <div className={classes.heroGlow} />
                <Container size="md">
                    <div className={classes.heroInner}>
                        <UserAvatar user={user} />

                        <p className={classes.userEyebrow}>Author</p>

                        <h1 className={classes.userName}>
                            {firstName && <>{firstName} </>}
                            <span className={classes.userNameHighlight}>
                                {lastName}
                            </span>
                        </h1>

                        {user.role && (
                            <span className={classes.rolePill}>
                                <span className={classes.rolePillDot} />
                                {user.role}
                            </span>
                        )}

                        <div className={classes.userMeta}>
                            <span>{user.email}</span>
                            <span className={classes.userMetaSep} />
                            <span>Joined {joinYear}</span>
                            {user.emailVerified && (
                                <>
                                    <span className={classes.userMetaSep} />
                                    <span>Verified</span>
                                </>
                            )}
                        </div>

                        <div className={classes.statsRow}>
                            <div className={classes.stat}>
                                <span className={classes.statNumber}>
                                    {books.length}
                                </span>
                                <span className={classes.statLabel}>
                                    {books.length === 1 ? "Book" : "Books"}
                                </span>
                            </div>
                            <div className={classes.statSep} />
                            <div className={classes.stat}>
                                <span className={classes.statNumber}>
                                    {joinYear}
                                </span>
                                <span className={classes.statLabel}>Since</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* ── Books ───────────────────────────────────── */}
            <section className={classes.booksSection}>
                <Container size="lg">
                    <div className={classes.sectionHeadRow}>
                        <h2 className={classes.sectionHeading}>Library</h2>
                        <div className={classes.sectionRule} />
                    </div>

                    {books.length === 0 ? (
                        <div className={classes.empty}>
                            <span className={classes.emptyGlyph}>✦</span>
                            <p className={classes.emptyText}>
                                No books published yet
                            </p>
                        </div>
                    ) : (
                        <Grid gutter={{ base: "sm", sm: "md", lg: "xl" }}>
                            {books.map((book, index) => (
                                <Grid.Col
                                    key={book.book.id}
                                    span={{ base: 12, xs: 6, md: 4 }}
                                >
                                    <BookCard book={book} index={index} />
                                </Grid.Col>
                            ))}
                        </Grid>
                    )}
                </Container>
            </section>
        </div>
    );
}
