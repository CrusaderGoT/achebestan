import { CreateStoryForm } from "@/components/forms/story/create-story-form";
import { authClient } from "@/lib/auth-client";

import { notFound } from "next/navigation";

export default function BookFormPage() {
    const { data: session } = authClient.useSession();

    if (!session?.session.id) notFound();

    return <CreateStoryForm />;
}
