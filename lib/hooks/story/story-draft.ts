"use client";

import {
    getUserStoryDraftsFromDb,
    syncStoryDraftToDbAction,
} from "@/lib/actions/story";
import { getDraftsByDate } from "@/lib/index-db";
import { StoryIndexDbSchemaType } from "@/types/story";
import { useQuery } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";

export const useSyncStoryDraftToDb = () => {
    return useAction(syncStoryDraftToDbAction);
};

export const useUserStoryDraftsFromDb = ({ userId }: { userId: string }) => {
    return useQuery({
        queryKey: ["user-story-drafts", { userId }],
        queryFn: async () => {
            const data = await getUserStoryDraftsFromDb(userId);

            return data;
        },
        enabled: !!userId,
    });
};

export function useMergedDrafts({ authorId }: { authorId: string }) {
    const remoteQuery = useUserStoryDraftsFromDb({ userId: authorId });
    const localQuery = useQuery({
        queryKey: ["indexdb-drafts"],
        queryFn: getDraftsByDate,
    });

    const isLoading = remoteQuery.isLoading || localQuery.isLoading;
    const isError = remoteQuery.isError || localQuery.isError;

    const mergedData = useMemo(() => {
        const remote = remoteQuery.data ?? [];
        const local = localQuery.data ?? [];

        const map = new Map<number, StoryIndexDbSchemaType>();

        // Combine both arrays into one loop
        [...remote, ...local].forEach((incomingItem) => {
            const id = incomingItem.id;
            if (!id) return; // Skip if no ID exists

            const existingItem = map.get(id);

            if (!existingItem) {
                // If it's not in the map yet, add it
                map.set(id, incomingItem);
            } else {
                // If it IS in the map, compare timestamps
                // We only overwrite if the incoming item is strictly newer
                if (incomingItem.updated > existingItem.updated) {
                    map.set(id, incomingItem);
                }
            }
        });

        // Return sorted by updated date (newest first)
        return Array.from(map.values()).sort((a, b) => b.updated - a.updated);
    }, [remoteQuery.data, localQuery.data]);

    return {
        data: mergedData,
        isLoading,
        isError,
    };
}
