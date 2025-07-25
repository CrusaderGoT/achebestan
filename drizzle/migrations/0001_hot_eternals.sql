DROP INDEX "author_id_idx";--> statement-breakpoint
CREATE INDEX "author_id_idx" ON "stories" USING btree ("author_id");