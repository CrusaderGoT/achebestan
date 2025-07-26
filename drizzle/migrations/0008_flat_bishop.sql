ALTER TABLE "books" DROP CONSTRAINT "books_storiesId_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "stories_idx" ON "books" USING btree ("stories_id");