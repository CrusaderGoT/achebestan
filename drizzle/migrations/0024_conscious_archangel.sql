ALTER TABLE "comments" DROP CONSTRAINT "comments_rating_id_ratings_id_fk";
--> statement-breakpoint
DROP INDEX "books_stories_uidx";--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_rating_id_ratings_id_fk" FOREIGN KEY ("rating_id") REFERENCES "public"."ratings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN "stories_id";