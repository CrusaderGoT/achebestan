"use client";

import {
    getUserStoryDraftsFromDb,
    syncStoryDraftToDbAction,
} from "@/lib/actions/story";
import { getDraftsByUserId } from "@/lib/index-db";
import { StoryIndexDbSchemaType } from "@/types/story";
import { useQuery } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

export const useSyncStoryDraftToDb = () => {
    return useAction(syncStoryDraftToDbAction);
};

// Normalises a draft coming from the DB where created/updated may have been
// serialised as ISO strings (JSON round-trip of a Date) rather than numbers.
function normaliseDraft(draft: StoryIndexDbSchemaType): StoryIndexDbSchemaType {
    return {
        ...draft,
        created:
            typeof draft.created === "number"
                ? draft.created
                : new Date(draft.created).getTime(),
        updated:
            typeof draft.updated === "number"
                ? draft.updated
                : new Date(draft.updated).getTime(),
    };
}

export const useMergedDrafts = ({ userId }: { userId: string }) => {
    return useQuery({
        queryKey: ["user-story-drafts", { userId }],
        queryFn: async () => {
            // allSettled so that a failure in either source never silently
            // wipes out the other. Before this fix, a single DB error caused
            // the entire queryFn to throw → data = undefined → no drafts shown.
            const [localResult, remoteResult] = await Promise.allSettled([
                getDraftsByUserId(userId),
                getUserStoryDraftsFromDb(userId),
            ]);

            const localDrafts =
                localResult.status === "fulfilled" ? localResult.value : [];

            const remoteDrafts =
                remoteResult.status === "fulfilled"
                    ? remoteResult.value.map(normaliseDraft)
                    : [];

            if (remoteResult.status === "rejected") {
                console.error(
                    "Failed to fetch remote drafts:",
                    remoteResult.reason,
                );
            }

            return [...localDrafts, ...remoteDrafts];
        },
        refetchOnWindowFocus: "always",
    });
};
