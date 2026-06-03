import { registerAs } from '@nestjs/config';

function parseOrigins(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export default registerAs('security', () => ({
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),
  bodyLimit: process.env.BODY_LIMIT ?? '100kb',
  rateLimitTtlMs: process.env.RATE_LIMIT_TTL_MS
    ? parseInt(process.env.RATE_LIMIT_TTL_MS, 10)
    : 60000,
  rateLimitMax: process.env.RATE_LIMIT_MAX
    ? parseInt(process.env.RATE_LIMIT_MAX, 10)
    : 60,
  authRateLimitTtlMs: process.env.AUTH_RATE_LIMIT_TTL_MS
    ? parseInt(process.env.AUTH_RATE_LIMIT_TTL_MS, 10)
    : 60000,
  authRateLimitMax: process.env.AUTH_RATE_LIMIT_MAX
    ? parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10)
    : 5,
}));
