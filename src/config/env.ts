import { z } from 'zod';

const envSchema = z.object({
  DATABASE: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.string(),
  DATABASE_USERNAME: z.string(),
  DATABASE_PASSWORD: z.string(),
  TOKEN_SECRET: z.string(),
  TOKEN_EXPIRATION: z.string(),
  API_PORT: z.string(),
});

export default envSchema.parse(process.env);
