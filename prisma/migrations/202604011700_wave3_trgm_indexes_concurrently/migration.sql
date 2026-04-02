-- Create GIN trigram indexes in migration-safe mode.
-- NOTE: Prisma migrate runs this SQL in a migration transaction, so
-- CREATE INDEX CONCURRENTLY is not used here.

CREATE INDEX IF NOT EXISTS "problem_title_trgm"
  ON "Problem" USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "problem_statement_trgm"
  ON "Problem" USING gin (statement gin_trgm_ops);
