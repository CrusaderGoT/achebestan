CREATE TABLE "books" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "books_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(256) NOT NULL,
	"subtitle" varchar(100),
	"authorId" text NOT NULL,
	"isbn" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL,
	"edited" timestamp,
	"image" varchar NOT NULL,
	"imageAlt" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "title_idx" ON "books" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "author_id_idx" ON "books" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "created_idx" ON "books" USING btree ("created");--> statement-breakpoint
CREATE UNIQUE INDEX "isbn_idx" ON "books" USING btree ("isbn");