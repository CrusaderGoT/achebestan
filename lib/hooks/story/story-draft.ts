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

// ─── useUserStoryDraftsFromDb ────────────────────────────────────────────────
// Fix: added refetchOnMount + refetchOnWindowFocus so a new device always hits
// the server instead of serving a potentially empty/stale cache.

export const useUserStoryDraftsFromDb = ({ userId }: { userId: string }) => {
    return useQuery({
        queryKey: ["user-story-drafts", { userId }],
        queryFn: async () => {
            const data = await getUserStoryDraftsFromDb(userId);
            return data;
        },
        enabled: !!userId,
        staleTime: 0, // always treat remote data as stale
        refetchOnMount: true, // re-fetch every time the component mounts
        refetchOnWindowFocus: true, // re-fetch when the user switches back to this tab/window
    });
};

// ─── useMergedDrafts ─────────────────────────────────────────────────────────
// Fixes applied:
//   1. queryKey is now user-scoped so two accounts on the same browser
//      don't bleed into each other.
//   2. staleTime: Infinity for the IndexedDB query — local data never goes stale.
//   3. Merge order flipped: local goes in first so remote overwrites it.
//      Remote is source of truth; >= means remote wins on tied timestamps.
//   4. Null guard changed from !id (drops id=0) to id == null.
//   5. Exposed isRemoteLoading / isLocalLoading separately so callers can
//      show a "syncing…" indicator independently.

export function useMergedDrafts({ authorId }: { authorId: string }) {
    const remoteQuery = useUserStoryDraftsFromDb({ userId: authorId });

    const localQuery = useQuery({
        queryKey: ["indexdb-drafts", { userId: authorId }], // fix 1: user-scoped
        queryFn: getDraftsByDate,
        staleTime: Infinity, // fix 2: IndexedDB is local, never stale
    });

    const isLoading = remoteQuery.isLoading || localQuery.isLoading;
    const isError = remoteQuery.isError || localQuery.isError;

    const mergedData = useMemo(() => {
        const remote = remoteQuery.data ?? [];
        const local = localQuery.data ?? [];

        const map = new Map<number, StoryIndexDbSchemaType>();

        // fix 3: local first so remote can overwrite it
        [...local, ...remote].forEach((incomingItem) => {
            const id = incomingItem.id;

            // fix 4: == null catches undefined/null but not 0
            if (id == null) return;

            const existingItem = map.get(id);

            if (!existingItem) {
                map.set(id, incomingItem);
            } else if (incomingItem.updated >= existingItem.updated) {
                // >= so remote (later in spread) wins ties
                map.set(id, incomingItem);
            }
        });

        return Array.from(map.values()).sort((a, b) => b.updated - a.updated);
    }, [remoteQuery.data, localQuery.data]);

    return {
        data: mergedData,
        isLoading,
        isError,
        isRemoteLoading: remoteQuery.isLoading, // fix 5
        isLocalLoading: localQuery.isLoading, // fix 5
    };
}

export const useNewMergedDrafts = ({ userId }: { userId: string }) => {
    return useQuery({
        queryKey: ["user-story-drafts", { userId }],
        queryFn: async () => {
            const localDrafts = await getDraftsByDate();
            const dbDrafts = await getUserStoryDraftsFromDb(userId);

            return [...localDrafts, ...dbDrafts];
        },
    });
};
