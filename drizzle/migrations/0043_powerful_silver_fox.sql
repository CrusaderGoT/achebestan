CREATE TABLE "story_drafts" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"content" text NOT NULL,
	"blurb" text,
	"created" integer NOT NULL,
	"updated" integer NOT NULL,
	"book" jsonb
);
