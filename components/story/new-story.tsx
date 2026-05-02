"use client";

import NotFound from "@/app/not-found";
import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { useCanCreateStory } from "@/lib/hooks/story/story-permissions";
import { Skeleton } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { CreateStoryForm } from "../forms/story/create-story-form";

export function NewStory() {
    const mounted = useMounted();

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

    // Return a placeholder or null during SSR
    if (!mounted) {
        return <Skeleton style={{ height: "400px" }} />;
    }

    if (isActivelyChecking) {
        return null;
    }

    if (session && canCreateStory) {
        return <CreateStoryForm authorId={session.user.id} />;
    }

    // In all other cases (logged out, no permission), show the 404 immediately.
    return <NotFound />;
}
