ALTER TABLE "stories" DROP CONSTRAINT "stories_book_id_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "book_id_idx" ON "stories" USING btree ("book_id");--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_bookId_unique" UNIQUE("book_id");