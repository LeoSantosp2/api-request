import { z } from 'zod';
import isEmail from 'validator/lib/isEmail';

export const userRequestSchema = z
  .object({
    firstName: z.string().trim().min(1, 'O nome não pode estar vazio.'),
    lastName: z.string().trim().min(1, 'O sobrenome não pode estar vazio.'),
    email: z
      .string()
      .trim()
      .min(1, 'O e-mail não pode estar vazio.')
      .refine(isEmail, 'E-mail inválido.'),
    password: z.string().min(1, 'A senha não pode estar vazia.'),
    confirmPassword: z.string().min(1, 'Confirmar senha não pode estar vazio.'),
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
  firstName: z.string().trim().min(1, 'O nome não pode estar vazio.'),
  lastName: z.string().trim().min(1, 'O sobrenome não pode estar vazio.'),
});
