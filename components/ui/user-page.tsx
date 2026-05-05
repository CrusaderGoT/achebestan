"use client";

import { getUserAndBooksWithStoryCount } from "@/lib/actions/user";
import classes from "@/styles/user-page.module.css";
import { Box, Text, Title } from "@mantine/core";
import {
    IconArrowUpRight,
    IconBrandGithub,
    IconBrandTwitter,
    IconCalendar,
    IconMail,
    IconShieldCheck,
} from "@tabler/icons-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────

export type UserAndBooksWithStoryCountType = Awaited<
    ReturnType<typeof getUserAndBooksWithStoryCount>
>;

// ── Avatar Component ──────────────────────────────────────────

function AuthorAvatar({
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
        <Box className={classes.avatar}>
            <Box className={classes.avatarRing} />
            {user.image ? (
                <img
                    src={user.image}
                    alt={user.name}
                    className={classes.avatarImage}
                />
            ) : (
                <Box className={classes.avatarFallback}>{initials}</Box>
            )}
            <Box className={classes.statusDot} />
        </Box>
    );
}

// ── Navigation Item ───────────────────────────────────────────

function NavItem({
    label,
    active,
    onClick,
}: {
    label: string;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <Box
            component="button"
            className={`${classes.navItem} ${active ? classes.active : ""}`}
            onClick={onClick}
        >
            <Box className={classes.navLine} />
            <Text inherit>{label}</Text>
        </Box>
    );
}

// ── Book Item ─────────────────────────────────────────────────

function BookItem({
    book,
}: {
    book: UserAndBooksWithStoryCountType["books"][0];
}) {
    const { book: bookData, bookStoriesCount } = book;
    const year = new Date(bookData.created).getFullYear();

    return (
        <Link href={`/books/${bookData.id}`} className={classes.bookItem}>
            <Text className={classes.bookYear}>{year}</Text>
            <Box className={classes.bookInfo}>
                <Title order={3} className={classes.bookName}>
                    {bookData.name}
                </Title>
                <Text className={classes.bookMeta}>
                    {bookStoriesCount}{" "}
                    {bookStoriesCount === 1 ? "story" : "stories"}
                </Text>
            </Box>
            <IconArrowUpRight size={18} className={classes.bookArrow} />
        </Link>
    );
}

// ── Stat Card ─────────────────────────────────────────────────

function StatCard({ value, label }: { value: string | number; label: string }) {
    return (
        <Box className={classes.statCard}>
            <Text className={classes.statValue}>{value}</Text>
            <Text className={classes.statLabel}>{label}</Text>
        </Box>
    );
}

// ── Main Page Component ───────────────────────────────────────

export function UserPage({ user, books }: UserAndBooksWithStoryCountType) {
    const joinYear = new Date(user.createdAt).getFullYear();
    const totalStories = books.reduce((sum, b) => sum + b.bookStoriesCount, 0);

    return (
        <Box className={classes.page}>
            <Box className={classes.layout}>
                {/* ── Sidebar ─────────────────────────────────── */}
                <Box component="aside" className={classes.sidebar}>
                    <Box className={classes.authorHeader}>
                        <AuthorAvatar user={user} />

                        <Box>
                            <Title order={1} className={classes.authorName}>
                                {user.name}
                            </Title>
                            {user.role && (
                                <Text className={classes.authorTitle}>
                                    {user.role}
                                </Text>
                            )}
                        </Box>

                        <Text className={classes.authorBio}>
                            A storyteller weaving narratives that explore the
                            depths of human experience. Currently crafting{" "}
                            <strong>{books.length} published works</strong> with{" "}
                            <strong>{totalStories} stories</strong> that span
                            genres and emotions.
                        </Text>

                        {/* Contact Info */}
                        <Box className={classes.contactInfo}>
                            <Box className={classes.contactItem}>
                                <IconMail
                                    size={16}
                                    className={classes.contactIcon}
                                />
                                <Text inherit>{user.email}</Text>
                            </Box>
                            <Box className={classes.contactItem}>
                                <IconCalendar
                                    size={16}
                                    className={classes.contactIcon}
                                />
                                <Text inherit>Member since {joinYear}</Text>
                            </Box>
                            {user.emailVerified && (
                                <Box className={classes.verifiedBadge}>
                                    <IconShieldCheck size={12} />
                                    <Text inherit>Verified</Text>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Navigation */}
                    <Box component="nav" className={classes.nav}>
                        <NavItem label="About" active />
                        <NavItem label="Published" />
                        <NavItem label="Stats" />
                    </Box>

                    {/* Social Links */}
                    <Box className={classes.socialLinks}>
                        <Link href="#" className={classes.socialLink}>
                            <IconBrandGithub size={20} />
                        </Link>
                        <Link href="#" className={classes.socialLink}>
                            <IconBrandTwitter size={20} />
                        </Link>
                    </Box>
                </Box>

                {/* ── Main Content ────────────────────────────── */}
                <Box component="main" className={classes.main}>
                    {/* Stats Section */}
                    <Box className={classes.section}>
                        <Box className={classes.sectionHeader}>
                            <Title order={2} className={classes.sectionTitle}>
                                Overview
                            </Title>
                            <Box className={classes.sectionLine} />
                        </Box>

                        <Box className={classes.statsGrid}>
                            <StatCard value={books.length} label="Books" />
                            <StatCard value={totalStories} label="Stories" />
                            <StatCard value={joinYear} label="Since" />
                        </Box>
                    </Box>

                    {/* Published Books Section */}
                    <Box className={classes.section}>
                        <Box className={classes.sectionHeader}>
                            <Title order={2} className={classes.sectionTitle}>
                                Published
                            </Title>
                            <Box className={classes.sectionLine} />
                        </Box>

                        {books.length === 0 ? (
                            <Box className={classes.empty}>
                                <Text className={classes.emptyIcon}>B</Text>
                                <Text className={classes.emptyText}>
                                    No books published yet
                                </Text>
                            </Box>
                        ) : (
                            <Box className={classes.bookList}>
                                {books.map((bookData) => (
                                    <BookItem
                                        key={bookData.book.id}
                                        book={bookData}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
