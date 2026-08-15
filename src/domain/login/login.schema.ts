import isEmail from 'validator/lib/isEmail';
import { z } from 'zod';

export const loginRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail não pode estar vazio.')
    .refine(isEmail, 'E-mail inválido.'),
  password: z.string().min(1, 'A senha não pode estar vazia.'),
});
