ALTER TABLE "stories" DROP CONSTRAINT "stories_book_id_book_id_fk";
--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "book_part" integer;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_bookPart_unique" UNIQUE("book_part");--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "book_fields_together" CHECK (("stories"."book_id" IS NULL AND "stories"."book_part" IS NULL) OR 
            ("stories"."book_id" IS NOT NULL AND "stories"."book_part" IS NOT NULL));

-- Create trigger function for sync null of book id and book part
CREATE OR REPLACE FUNCTION sync_book_part_with_book_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If bookId becomes NULL, set bookPart to NULL
  IF NEW.book_id IS NULL AND OLD.book_id IS NOT NULL THEN
    NEW.book_part := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to table
CREATE TRIGGER sync_book_part
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION sync_book_part_with_book_id();