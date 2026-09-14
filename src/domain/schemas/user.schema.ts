import { z } from 'zod';
import isEmail from 'validator/lib/isEmail';

export const userRequestSchema = z
  .object({
    firstName: z.string().min(1, 'Os campos não podem estar vazios.'),
    lastName: z.string().min(1, 'Os campos não podem estar vazios.'),
    email: z
      .string()
      .min(1, 'Os campos não podem estar vazios.')
      .refine(isEmail, 'E-mail inválido.'),
    password: z.string().min(1, 'Os campos não podem estar vazios.'),
    confirmPassword: z.string().min(1, 'Os campos não podem estar vazios.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas devem ser iguais.',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => data.password.length >= 8 && data.confirmPassword.length >= 8,
    {
      message: 'A senha deve ter no minímo 8 caracteres.',
      path: ['password'],
    },
  );

export const updateRequestSchema = z.object({
  firstName: z.string().min(1, 'Os campos não podem estar vazios.'),
  lastName: z.string().min(1, 'Os campos não podem estar vazios.'),
});
