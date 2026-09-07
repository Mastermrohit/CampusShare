/*
# Update listings category constraint

## Changes
- Drops the old CHECK constraint on listings.category that allowed: Books, Electronics, Lab Gear, Miscellaneous
- Adds a new CHECK constraint allowing: Textbooks, Electronics, Lab Gear, Sports, Misc
- This aligns the schema with the new category filter pills in the UI

## Notes
1. Existing rows with 'Books' are updated to 'Textbooks' and 'Miscellaneous' to 'Misc' before the constraint swap so no data violates the new constraint.
2. The constraint is dropped and recreated (CREATE POLICY style: drop first, then create).
*/

UPDATE listings SET category = 'Textbooks' WHERE category = 'Books';
UPDATE listings SET category = 'Misc' WHERE category = 'Miscellaneous';

ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_category_check;

ALTER TABLE listings ADD CONSTRAINT listings_category_check
  CHECK (category IN ('Textbooks', 'Electronics', 'Lab Gear', 'Sports', 'Misc'));
