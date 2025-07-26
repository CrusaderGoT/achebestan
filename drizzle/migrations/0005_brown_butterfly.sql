ALTER TABLE "stories" DROP CONSTRAINT "stories_bookId_unique";--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_book_id_unique" UNIQUE("book_id");