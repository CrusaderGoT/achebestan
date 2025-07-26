import { HomePage } from "@/components/ui/homepage";
import { readLatestStories } from "@/lib/actions/story";

export default async function Home() {
    const stories = await readLatestStories(10);
    return <HomePage stories={stories} />;
}
