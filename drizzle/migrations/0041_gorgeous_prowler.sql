ALTER TABLE "stories" DROP CONSTRAINT IF EXISTS "stories_bookPart_unique";
ALTER TABLE "stories" DROP CONSTRAINT IF EXISTS "stories_isbn_bookPart_unique";
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stories_book_id_book_part_uidx'
  ) THEN
    ALTER TABLE "stories" ADD CONSTRAINT "stories_book_id_book_part_uidx" UNIQUE("book_id","book_part");
  END IF;
END $$;