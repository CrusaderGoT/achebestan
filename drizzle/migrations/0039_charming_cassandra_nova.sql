DROP INDEX "stories_book_id_uidx";--> statement-breakpoint
CREATE INDEX "stories_book_id_idx" ON "stories" USING btree ("book_id");