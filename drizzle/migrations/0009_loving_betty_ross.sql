DROP INDEX "stories_idx";--> statement-breakpoint
DROP INDEX "title_idx";--> statement-breakpoint
DROP INDEX "subtitle_idx";--> statement-breakpoint
DROP INDEX "author_id_idx";--> statement-breakpoint
DROP INDEX "created_idx";--> statement-breakpoint
DROP INDEX "edited_idx";--> statement-breakpoint
DROP INDEX "isbn_idx";--> statement-breakpoint
DROP INDEX "book_id_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "books_stories_uidx" ON "books" USING btree ("stories_id");--> statement-breakpoint
CREATE INDEX "stories_title_idx" ON "stories" USING btree ("title");--> statement-breakpoint
CREATE INDEX "stories_subtitle_idx" ON "stories" USING btree ("subtitle");--> statement-breakpoint
CREATE INDEX "stories_author_id_idx" ON "stories" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "stories_created_idx" ON "stories" USING btree ("created");--> statement-breakpoint
CREATE INDEX "stories_edited_idx" ON "stories" USING btree ("edited");--> statement-breakpoint
CREATE UNIQUE INDEX "stories_isbn_uidx" ON "stories" USING btree ("isbn");--> statement-breakpoint
CREATE UNIQUE INDEX "stories_book_id_uidx" ON "stories" USING btree ("book_id");