-- Step 1: Add slug column as nullable first
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;

-- Step 2: Populate slugs for existing products based on their names only
UPDATE "Product" 
SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g'))
WHERE "slug" IS NULL;

-- Handle duplicate slugs by appending a number
DO $$
DECLARE
    product_record RECORD;
    counter INTEGER;
    new_slug TEXT;
BEGIN
    FOR product_record IN 
        SELECT id, slug FROM "Product" WHERE id IN (
            SELECT id FROM "Product" 
            GROUP BY slug HAVING COUNT(*) > 1
        )
    LOOP
        counter := 1;
        new_slug := product_record.slug || '-' || counter;
        
        WHILE EXISTS (SELECT 1 FROM "Product" WHERE slug = new_slug AND id != product_record.id) LOOP
            counter := counter + 1;
            new_slug := product_record.slug || '-' || counter;
        END LOOP;
        
        UPDATE "Product" SET slug = new_slug WHERE id = product_record.id;
    END LOOP;
END $$;

-- Step 3: Make slug unique and required
ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

