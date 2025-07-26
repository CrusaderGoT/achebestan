ALTER TABLE "stories" DROP CONSTRAINT "book_id_fk";
--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;