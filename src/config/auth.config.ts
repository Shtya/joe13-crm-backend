// src/config/auth.config.ts
import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    secret: process.env.ACCESS_TOKEN_SECRET || 'default_access_secret',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret',
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  }),
);
