"use client";

import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { useCanCreateStory } from "@/lib/hooks/story/story-permissions";
import { Loader } from "@mantine/core";
import { notFound } from "next/navigation";
import { CreateStoryForm } from "../forms/story/create-story-form";

export function NewStory() {
    const {
        sessionUser: { data: session },
    } = useCentralizedAuth();

    const { data: canCreateStory, isPending } = useCanCreateStory({
        userId: session?.user.id,
    });

    if (isPending) {
        return <Loader />;
    }

    if (!canCreateStory && !isPending) {
        return notFound();
    }

    return <CreateStoryForm />;
}
