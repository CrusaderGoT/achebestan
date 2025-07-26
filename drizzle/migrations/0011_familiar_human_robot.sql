ALTER TABLE "books" ADD COLUMN "author_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "books_author_id_idx" ON "books" USING btree ("author_id");