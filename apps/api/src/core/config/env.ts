import { z } from 'zod';

const nullableNumber = z.preprocess((value) => {
  if (value === '' || value === 'null' || value === undefined) {
    return null;
  }

  return Number(value);
}, z.number().int().min(0).nullable());

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default('api'),
  APP_ORIGIN: z.string().url().default('http://localhost:3007'),
  CORS_ORIGINS: z.string().default('http://localhost:3007'),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),
  INITIAL_ADMIN_LOGIN: z.string().optional(),
  INITIAL_ADMIN_PASSWORD: z.string().optional(),
  SHIFT_EMPLOYEE_EDIT_LIMIT_MINUTES: nullableNumber.default(1440),
  XLSX_EXPORT_MAX_ROWS: z.coerce.number().int().positive().default(10000),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_BOT_MODE: z.enum(['disabled', 'polling', 'webhook']).default('disabled'),
  TELEGRAM_WEBHOOK_URL: z.string().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(8),
  TELEGRAM_LINK_CODE_TTL_MINUTES: z.coerce.number().int().positive().default(15),
});

export type AppEnv = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function parseDurationMs(value: string): number {
  const match = /^(\d+)([smhd])?$/.exec(value.trim());

  if (!match) {
    throw new Error(`Invalid duration: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const multiplierByUnit: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * (multiplierByUnit[unit] ?? 1000);
}

export function getCorsOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
