ALTER TABLE "comments" DROP CONSTRAINT "comment_subcomment_fk";
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "created" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "edited" timestamp;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comment_parent_comment_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comment_story_idx" ON "comments" USING btree ("story_isbn");--> statement-breakpoint
CREATE INDEX "comment_user_idx" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comment_parent_idx" ON "comments" USING btree ("parent_comment_id");