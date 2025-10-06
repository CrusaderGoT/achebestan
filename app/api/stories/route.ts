import { NextResponse } from "next/server";
import { readLatestStories } from "@/lib/actions/story";

export async function GET() {
    try {
        const stories = await readLatestStories(10);

        // If stories is undefined or null, return an empty array (200) so callers always get a predictable payload.
        if (!stories) {
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(stories, { status: 200 });
    } catch (error) {
        // Log the error server-side and return a 500 response
        console.error("Failed to read stories:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
