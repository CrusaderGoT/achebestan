ALTER TABLE "stories" DROP CONSTRAINT "stories_bookPart_unique";--> statement-breakpoint
ALTER TABLE "stories" DROP CONSTRAINT "stories_isbn_bookPart_unique";--> statement-breakpoint
DO $$
BEGIN
    IF NO EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'stories_book_id_book_part_uidx'
            AND conrelid = 'stories'::regclass
    ) THEN
        ALTER TABLE "stories" ADD CONSTRAINT "stories_book_id_book_part_uidx" UNIQUE("book_id","book_part");
    END IF;
END $$;

