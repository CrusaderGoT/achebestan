import { CreateStoryForm } from "@/components/forms/story/create-story-form";
import { auth } from "@/lib/auth/auth";
import { canCreateStory } from "@/lib/auth/policies";
import { headers } from "next/headers";

import { notFound } from "next/navigation";

export default async function BookFormPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const canCreate = await canCreateStory();

    if (!session?.session.id || !canCreate) notFound();

    return <CreateStoryForm />;
}
