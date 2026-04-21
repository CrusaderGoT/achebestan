"use client";

import { readLatestStories, searchStories } from "@/lib/actions/story";
import {
    ActionIcon,
    Badge,
    Box,
    Center,
    Group,
    Image,
    Loader,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useDebouncedValue, useMounted } from "@mantine/hooks";
import { nprogress } from "@mantine/nprogress";
import { Spotlight, spotlight } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Helper function moved outside component to prevent recreation
const isRecentStory = (createdDate: Date | string | number): boolean => {
    const days = dayjs().diff(dayjs(createdDate), "day");
    return days >= 0 && days <= 7;
};

export function SearchSpotlight() {
    const mounted = useMounted();
    const router = useRouter();
    const pathname = usePathname();

    // 1. UI State
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebouncedValue(search, 400);
    const [activeLink, setActiveLink] = useState<string | undefined>(undefined);

    // 2. Fetch Initial/Default Stories
    const { data: initialStories = [], isLoading: isInitialLoading } = useQuery(
        {
            queryKey: ["stories", "latest"],
            queryFn: async () => {
                const res = await readLatestStories();
                return res || [];
            },
            staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        },
    );

    // 3. Fetch Search Results
    const { data: searchResults = [], isFetching: isSearchLoading } = useQuery({
        queryKey: ["stories", "search", debouncedSearch],
        queryFn: () => searchStories(debouncedSearch, { limit: 20 }),
        enabled: debouncedSearch.trim().length > 0, // Only run if there is text
        staleTime: 1000 * 60 * 2, // Cache search results for 2 minutes
    });

    // 4. Compute Results to Display
    const displayItems = useMemo(() => {
        // If we have an active server search, use those results
        if (debouncedSearch.trim()) {
            return searchResults;
        }

        // Instant client-side filtering while typing (before debounce hits server)
        if (search.trim() && initialStories.length > 0) {
            const query = search.toLowerCase().trim();
            return initialStories.filter(
                (item) =>
                    item.title.toLowerCase().includes(query) ||
                    item.subtitle?.toLowerCase().includes(query),
            );
        }

        // Default state: show latest stories
        return initialStories;
    }, [search, debouncedSearch, searchResults, initialStories]);

    const isLoading = isInitialLoading || isSearchLoading;
    const hasSearched = debouncedSearch.trim().length > 0;

    // 5. Navigation Progress Effect
    useEffect(() => {
        if (!activeLink || !mounted) return;

        if (pathname === activeLink) {
            const timer = setTimeout(() => nprogress.complete(), 100);
            return () => clearTimeout(timer);
        }
    }, [pathname, activeLink, mounted]);

    // 6. Action Items Mapping
    const items = displayItems.map((item) => (
        <Spotlight.Action
            key={item.id}
            onClick={() => {
                spotlight.close();
                nprogress.start();

                const targetPath = `/stories/${item.isbn}`;

                if (pathname === targetPath) {
                    setTimeout(() => nprogress.complete(), 100);
                } else {
                    setActiveLink(targetPath);
                    router.push(targetPath); // Prefer push over replace for standard navigation unless strictly necessary
                }
            }}
        >
            <Group wrap="nowrap" w="100%">
                {item.image && (
                    <Center>
                        <Image
                            src={item.image}
                            alt={item.title}
                            width={50}
                            height={50}
                            radius="sm"
                        />
                    </Center>
                )}

                <Box style={{ flex: 1 }}>
                    <Text size="sm" fw={500} lineClamp={1}>
                        {item.title}
                    </Text>

                    {item.subtitle && (
                        <Text opacity={0.6} size="xs" lineClamp={1}>
                            {item.subtitle}
                        </Text>
                    )}

                    {item.blurb && (
                        <Text opacity={0.4} size="xs" lineClamp={2}>
                            {item.blurb}
                        </Text>
                    )}
                </Box>

                <Stack gap={4} align="flex-end">
                    {isRecentStory(item.created) && (
                        <Badge variant="light" color="green" size="xs">
                            New
                        </Badge>
                    )}
                    <Text size="xs" opacity={0.5}>
                        {dayjs(item.created).format("DD-MMM-YYYY")}
                    </Text>
                </Stack>
            </Group>
        </Spotlight.Action>
    ));

    return (
        <>
            <ActionIcon
                onClick={spotlight.open}
                variant="subtle"
                aria-label="Open search"
                hiddenFrom="sm"
            >
                <IconSearch stroke={1.5} />
            </ActionIcon>

            <TextInput
                visibleFrom="sm"
                onClick={spotlight.open}
                radius="md"
                placeholder="Search..."
                readOnly // Prevent typing in the trigger input to force Spotlight usage
                leftSection={<IconSearch stroke={1.5} size={15} />}
            />

            <Spotlight.Root
                query={search}
                onQueryChange={setSearch}
                scrollable
                maxHeight={400}
            >
                <Spotlight.Search
                    placeholder="Search stories by title or subtitle..."
                    leftSection={<IconSearch stroke={1.5} size={16} />}
                    rightSection={isLoading && <Loader size={18} />}
                />

                <Spotlight.ActionsList>
                    {isLoading && items.length === 0 ? (
                        <Center p="md">
                            <Loader size="sm" />
                        </Center>
                    ) : items.length > 0 ? (
                        <>
                            {hasSearched && (
                                <Text size="xs" opacity={0.6} p="xs">
                                    Found {items.length} result
                                    {items.length !== 1 ? "s" : ""}
                                </Text>
                            )}
                            {items}
                        </>
                    ) : (
                        <Spotlight.Empty>
                            {hasSearched
                                ? `No stories found for "${search}"`
                                : "Start typing to search stories..."}
                        </Spotlight.Empty>
                    )}
                </Spotlight.ActionsList>
            </Spotlight.Root>
        </>
    );
}
