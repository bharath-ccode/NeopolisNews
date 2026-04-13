-- ══════════════════════════════════════════════════════════════════════════════
-- Clean up test/placeholder data — keep only real data
-- Run this in Supabase Dashboard → SQL Editor → New query
-- ══════════════════════════════════════════════════════════════════════════════

-- Step 1: Remove test articles (construction + launches + community categories)
-- The infrastructure articles are real — leave them alone.
DELETE FROM articles
WHERE category IN ('construction', 'launches', 'community')
   OR (category = 'infrastructure' AND source IS NULL);

-- Step 2: Remove all projects except MSN One
-- (replace 'MSN One' with the exact project_name value in your DB if different)
DELETE FROM projects
WHERE LOWER(project_name) NOT LIKE '%msn one%';

-- Step 3: Remove all builders except MSN Realty
-- (replace 'MSN Realty' with the exact builder_name value in your DB if different)
DELETE FROM builders
WHERE LOWER(builder_name) NOT LIKE '%msn%';

-- Step 4: Verify what remains
SELECT 'articles' AS table_name, category, COUNT(*) FROM articles GROUP BY category
UNION ALL
SELECT 'builders', builder_name, 1 FROM builders
UNION ALL
SELECT 'projects', project_name, 1 FROM projects;
