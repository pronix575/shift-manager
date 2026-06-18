import { defineConfig, env } from 'prisma/config';
import { config } from 'dotenv';

config({ path: '../../.env' });
config({ path: '.env', override: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
});
