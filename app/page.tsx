import { HomePage } from "@/components/ui/homepage";
import { readLatestStories } from "@/lib/actions/story";

const stories = await readLatestStories(10);

export default async function Home() {
    return <HomePage stories={stories} />;
}

export async function generateStaticParams() {
    // params to prefetch story across child route, when needed
    return stories?.map((story) => ({
        isbn: story.isbn,
    }));
}
