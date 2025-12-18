ALTER TABLE "comments" DROP CONSTRAINT "comment_parent_comment_fk";
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comment_parent_comment_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;