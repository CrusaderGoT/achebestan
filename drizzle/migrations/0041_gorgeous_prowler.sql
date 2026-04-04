SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'stories'::regclass;

SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'stories';