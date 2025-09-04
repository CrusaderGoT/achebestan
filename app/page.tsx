import { HomePage } from "@/components/home/homepage";
import { readLatestStories } from "@/lib/actions/story";

export default async function Home() {
    const stories = await readLatestStories(10);
    return <HomePage stories={stories} />;
}

export const revalidate = 86400; // 24 hours in seconds
