import { z } from 'zod';
import isEmail from 'validator/lib/isEmail';

export const loginRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail inválido.')
    .refine(isEmail, 'E-mail inválido.'),
  password: z.string().min(1, 'Senha inválida.'),
});
