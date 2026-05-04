ALTER TABLE "stories" DROP CONSTRAINT "stories_book_id_book_id_fk";
--> statement-breakpoint
DROP INDEX "stories_subtitle_idx";--> statement-breakpoint
DROP INDEX "stories_created_idx";--> statement-breakpoint
DROP INDEX "stories_edited_idx";--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;