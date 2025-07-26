CREATE TABLE "books" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "books_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"stories_id" json[],
	CONSTRAINT "books_storiesId_unique" UNIQUE("stories_id")
);
--> statement-breakpoint
ALTER TABLE "stories" DROP CONSTRAINT "stories_author_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "book_id" integer;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_bookId_unique" UNIQUE("book_id");