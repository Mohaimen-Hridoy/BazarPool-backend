import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_bazarpool_jwt_key_2026_dev',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  expiryCronSchedule: process.env.EXPIRY_CRON_SCHEDULE || '* * * * *',
};
