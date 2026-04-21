"use client";

import NotFound from "@/app/not-found";
import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { useCanCreateStory } from "@/lib/hooks/story/story-permissions";
import { CreateStoryForm } from "../forms/story/create-story-form";

export function NewStory() {
    const {
        sessionUser: { data: session },
    } = useCentralizedAuth();

    const { data: canCreateStory, isPending } = useCanCreateStory({
        userId: session?.user.id,
    });

    if (isPending) return null;

    if (canCreateStory) {
        return <CreateStoryForm />;
    }

    return <NotFound />; // return component instead of notFound to allow for dynamic change, when user is authorized
}
