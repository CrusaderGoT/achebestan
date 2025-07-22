ALTER TABLE "books" ALTER COLUMN "title" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "subtitle" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "image" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "imageAlt" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "subtitle_idx" ON "books" USING btree ("subtitle");--> statement-breakpoint
CREATE INDEX "edited_idx" ON "books" USING btree ("edited");