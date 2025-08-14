ALTER TABLE "comments" RENAME COLUMN "sub_comment_id" TO "parent_comment_id";--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comment_subcomment_fk";
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comment_subcomment_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;