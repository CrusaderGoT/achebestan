"use client";

import NotFound from "@/app/not-found";
import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { useCanCreateStory } from "@/lib/hooks/story/story-permissions";
import { CreateStoryForm } from "../forms/story/create-story-form";

export function NewStory() {
    const {
        sessionUser: { data: session, isPending: isSessionPending },
    } = useCentralizedAuth();

    const {
        data: canCreateStory,
        isPending: isPermsPending,
        fetchStatus,
    } = useCanCreateStory({
        userId: session?.user?.id,
    });

    const isActivelyChecking =
        isSessionPending ||
        (!!session && isPermsPending && fetchStatus !== "idle");

    if (isActivelyChecking) {
        return null;
    }

    if (session && canCreateStory) {
        return <CreateStoryForm />;
    }

    // In all other cases (logged out, no permission), show the 404 immediately.
    return <NotFound />;
}
