CREATE TABLE "favourite_user_stories" (
	"user_id" text NOT NULL,
	"story_id" integer NOT NULL,
	CONSTRAINT "favourite_user_stories_user_id_story_id_pk" PRIMARY KEY("user_id","story_id")
);
--> statement-breakpoint
ALTER TABLE "favourite_user_stories" ADD CONSTRAINT "favourite_user_stories_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favourite_user_stories" ADD CONSTRAINT "favourite_user_stories_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;