-- See the duplicates first
SELECT name, COUNT(*) 
FROM books 
GROUP BY name 
HAVING COUNT(*) > 1;

-- Delete duplicates, keeping the row with the lowest id
DELETE FROM books
WHERE id NOT IN (
  SELECT MIN(id)
  FROM books
  GROUP BY name
);

ALTER TABLE "books" ADD CONSTRAINT "books_name_unique" UNIQUE("name");