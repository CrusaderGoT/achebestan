"use client";

import { readLatestStories, searchStories } from "@/lib/actions/story";
import { StorySelectType } from "@/zod-schemas/story";
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
import { useDebouncedCallback, useIsFirstRender } from "@mantine/hooks";
import { Spotlight, spotlight } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Define search options interface to match the improved function
interface SearchState {
    results: Omit<StorySelectType, "content">[];
    loading: boolean;
    hasSearched: boolean;
}

export function SearchSpotlight() {
    const router = useRouter();

    const [search, setSearch] = useState("");

    const [searchState, setSearchState] = useState<SearchState>({
        results: [],
        loading: false,
        hasSearched: false,
    });

    const firstRendered = useIsFirstRender();

    // Load initial stories on first render
    useEffect(() => {
        if (!firstRendered || searchState.hasSearched) return;

        async function loadInitialStories() {
            setSearchState((prev) => ({ ...prev, loading: true }));

            try {
                const stories = await readLatestStories();
                if (stories) {
                    setSearchState({
                        results: stories,
                        loading: false,
                        hasSearched: false, // These are default stories, not search results
                    });
                }
            } catch (error) {
                console.error("Failed to load initial stories:", error);
                setSearchState((prev) => ({ ...prev, loading: false }));
            }
        }

        loadInitialStories();
    }, [firstRendered, searchState.hasSearched]);

    // Handle search with improved function
    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            // If search is cleared, reload initial stories
            const stories = await readLatestStories();
            setSearchState({
                results: stories || [],
                loading: false,
                hasSearched: false,
            });
            return;
        }

        setSearchState((prev) => ({ ...prev, loading: true }));

        try {
            const searchResults = await searchStories(query, {
                limit: 20,
                sortBy: "created",
                sortOrder: "desc",
                fields: ["title", "subtitle"],
            });

            setSearchState({
                results: searchResults,
                loading: false,
                hasSearched: true,
            });
        } catch (error) {
            console.error("Search failed:", error);
            setSearchState((prev) => ({
                ...prev,
                loading: false,
                results: [], // Clear results on error
            }));
        }
    }, []);

    // Debounced search handler
    const debouncedSearch = useDebouncedCallback(performSearch, 500);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;
        setSearch(value);
        debouncedSearch(value);
    };

    // Enhanced filtering - only filter if we haven't performed a server search
    const filteredResults = searchState.hasSearched
        ? searchState.results
        : searchState.results.filter(
              (item) =>
                  item.title
                      .toLowerCase()
                      .includes(search.toLowerCase().trim()) ||
                  (item.subtitle &&
                      item.subtitle
                          .toLowerCase()
                          .includes(search.toLowerCase().trim()))
          );

    // Render spotlight actions
    const items = filteredResults.map((item) => (
        <Spotlight.Action
            key={`${item.id}-${item.isbn}`} // Better key using ID
            onClick={() => {
                console.log("Selected story:", item);
                spotlight.close(); // Close spotlight after selection
                router.push(`/story/${item.isbn}`);
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

                    {/* Show ISBN for identification */}
                    {item.isbn && (
                        <Text opacity={0.4} size="xs">
                            ISBN: {item.isbn}
                        </Text>
                    )}
                </Box>

                <Stack gap={4} align="flex-end">
                    {/* Show "new" badge for recent items */}
                    {isRecentStory(item.created) && (
                        <Badge variant="light" color="green" size="xs">
                            New
                        </Badge>
                    )}

                    {/* Show creation date */}
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
                radius={"md"}
                placeholder="Search..."
                leftSection={<IconSearch stroke={1.5} size={15} />}
            />

            <Spotlight.Root
                query={search}
                onQueryChange={setSearch}
                scrollable
                maxHeight={400}
            >
                <Spotlight.Search
                    value={search}
                    onChange={handleChange}
                    placeholder="Search stories by title, subtitle, or ISBN..."
                    leftSection={<IconSearch stroke={1.5} size={16} />}
                    rightSection={searchState.loading && <Loader size={18} />}
                />

                <Spotlight.ActionsList>
                    {searchState.loading && items.length === 0 ? (
                        <Center p="md">
                            <Loader size="sm" />
                        </Center>
                    ) : items.length > 0 ? (
                        <>
                            {searchState.hasSearched && (
                                <Text size="xs" opacity={0.6} p="xs">
                                    Found {items.length} result
                                    {items.length !== 1 ? "s" : ""}
                                </Text>
                            )}
                            {items}
                        </>
                    ) : (
                        <Spotlight.Empty>
                            {searchState.hasSearched && !!search.trim()
                                ? `No stories found for "${search}"`
                                : "Start typing to search stories..."}
                        </Spotlight.Empty>
                    )}
                </Spotlight.ActionsList>
            </Spotlight.Root>
        </>
    );
}

function isRecentStory(createdDate: Date | string | number): boolean {
    const days = dayjs().diff(dayjs(createdDate), "day");
    return days >= 0 && days <= 7; // consider stories from last 7 days as "new"
}
