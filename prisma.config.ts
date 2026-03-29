import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load .env.local first (Next.js convention), fall back to .env
config({ path: '.env.local' });
config({ path: '.env' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'bun ./prisma/seed.ts',
  },
  datasource: {
    url: (() => {
      const url = process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'];
      if (!url) {
        // Fallback for CI/generation where actual connection is not required
        if (process.env['CI'] === 'true') {
          return 'postgresql://dummy:dummy@localhost:5432/dummy';
        }
        throw new Error(
          'DATABASE_URL or DIRECT_URL is not set. Please check your environment variables.',
        );
      }
      return url;
    })(),
  },
});
