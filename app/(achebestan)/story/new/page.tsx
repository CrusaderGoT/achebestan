import { CreateStoryForm } from "@/components/forms/story/create-story-form";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

import { notFound } from "next/navigation";

export default async function BookFormPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.session.id) notFound();

    return <CreateStoryForm />;
}
