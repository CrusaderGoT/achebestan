// STORY HELPERS and UTILS
import { RatingSelectType } from "@/zod-schemas/rating";

export function calculateRatingsAverage(
    ratings: RatingSelectType[],
    updateUserRating?: RatingSelectType
) {
    if (ratings.length < 1 && !updateUserRating) return 0;

    // Create a copy of ratings to work with
    const workingRatings = [...ratings];

    // Handle user rating update/addition
    if (updateUserRating?.userId) {
        const existingIndex = workingRatings.findIndex(
            (r) => r.userId === updateUserRating.userId
        );

        if (existingIndex >= 0) {
            // Update existing rating
            workingRatings[existingIndex] = updateUserRating;
        } else {
            // Add new rating
            workingRatings.push(updateUserRating);
        }
    }

    // Remove duplicates by keeping the latest rating per user
    const uniqueRatings = new Map<string, RatingSelectType>();

    workingRatings.forEach((rating) => {
        if (rating.userId) {
            uniqueRatings.set(rating.userId, rating);
        }
    });

    const uniqueRatingsArray = Array.from(uniqueRatings.values());

    if (uniqueRatingsArray.length === 0) return 0;

    // Calculate average from unique ratings
    const totalStars = uniqueRatingsArray.reduce(
        (sum, rating) => sum + rating.stars,
        0
    );
    return totalStars / uniqueRatingsArray.length;
}

export function highestRating(ratings: RatingSelectType[]) {
    if (ratings.length < 1) return 0;

    return Math.max(...ratings.map((r) => r.stars));
}

export function lowestRating(ratings: RatingSelectType[]) {
    if (ratings.length < 1) return 0;

    return Math.min(...ratings.map((r) => r.stars));
}

// Helper function to truncate text for descriptions
export function truncateText(text: string, maxLength: number = 160): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

// Helper function to extract reading time estimate
export function estimateReadingTime(content: string): number {
    const wordsPerMinute = 238; // average-reading-speed > https://scholarwithin.com/average-reading-speed
    const wordCount = content.split(/\s+/).length;

    return wordCount / wordsPerMinute;
}

export function formatEstimatedReadingTime(mins: number) {
    if (mins <= 0) return "a quick read";

    if (mins < 1 && mins > 0) {
        const timeInSeconds = Math.round(mins * 60);
        return timeInSeconds === 1
            ? `${timeInSeconds} second read`
            : `${timeInSeconds} seconds read`;
    }

    if (mins >= 60) {
        const timeInHours = Math.floor(mins / 60);
        const remainingMins = Math.floor(mins % 60);

        if (remainingMins === 0) {
            return timeInHours === 1
                ? `${timeInHours} hour read`
                : `${timeInHours} hours read`;
        }

        return timeInHours === 1
            ? `${timeInHours} hour ${remainingMins} mins read`
            : `${timeInHours} hours ${remainingMins} mins read`;
    }

    const timeInMinutes = Math.floor(mins);

    return timeInMinutes === 1
        ? `${timeInMinutes} minute read`
        : `${timeInMinutes} minutes read`;
}

// Helper function to create engaging tweet text
export function createTweetText(story: {
    title: string;
    subtitle?: string | null;
    blurb?: string | null;
}): string {
    const { title, subtitle, blurb } = story;

    // Start with the title
    let text = `${title}`;

    // Add subtitle if available and space allows
    if (subtitle && (text + ` - ${subtitle}`).length <= 200) {
        text += ` - ${subtitle}`;
    }

    // Add a compelling excerpt from blurb if available
    if (blurb && text.length <= 180) {
        const excerpt = createExcerpt(blurb, 200 - text.length - 10); // Leave space for ellipsis and spacing
        if (excerpt) {
            text += `\n\n${excerpt}`;
        }
    }

    return text;
}

// Helper function to create a smart excerpt from the blurb
export function createExcerpt(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;

    // Find the last complete sentence that fits
    const sentences = text.split(/[.!?]+/);
    let excerpt = "";

    for (const sentence of sentences) {
        const potential = excerpt + sentence.trim() + ".";
        if (potential.length <= maxLength - 3) {
            // Leave space for "..."
            excerpt = potential;
        } else {
            break;
        }
    }

    // If no complete sentence fits, truncate at word boundary
    if (!excerpt) {
        excerpt = text.substring(0, maxLength - 3);
        const lastSpace = excerpt.lastIndexOf(" ");
        if (lastSpace > 0) {
            excerpt = excerpt.substring(0, lastSpace);
        }
    }

    return excerpt + (excerpt.length < text.length ? "..." : "");
}
