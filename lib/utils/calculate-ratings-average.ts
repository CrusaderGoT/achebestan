import { RatingSelectType } from "@/zod-schemas/story";


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
