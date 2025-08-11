-- First, add a temporary column to store the UUIDs
ALTER TABLE "ratings" ADD COLUMN "story_isbn_temp" uuid;

-- Update the temporary column with the corresponding ISBN values
UPDATE "ratings" 
SET "story_isbn_temp" = "stories"."isbn"
FROM "stories" 
WHERE "ratings"."story_id" = "stories"."id";

-- Drop the old column
ALTER TABLE "ratings" DROP COLUMN "story_id";

-- Rename the temporary column
ALTER TABLE "ratings" RENAME COLUMN "story_isbn_temp" TO "story_isbn";

-- Make it NOT NULL
ALTER TABLE "ratings" ALTER COLUMN "story_isbn" SET NOT NULL;

-- Now create the foreign key constraint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_story_isbn_stories_isbn_fk" 
FOREIGN KEY ("story_isbn") REFERENCES "public"."stories"("isbn") ON DELETE cascade ON UPDATE no action;

-- Create the index
CREATE INDEX "ratings_story_isbn_idx" ON "ratings" USING btree ("story_isbn");