import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string(),
});

export default envSchema.parse(process.env);
