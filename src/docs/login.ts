import { z } from 'zod';

import { loginRequestSchema } from '../modules/login/login-schema';

import { registry } from './registry';
import { errorResponseSchema } from './common';

const loginResponseSchema = registry.register(
  'LoginResponse',
  z.object({
    id: z.string().openapi({ example: 'eddcdbb6-0294-4f0e-959c-fea84cd687c4' }),
    email: z.string().openapi({ example: 'joao@email.com' }),
    token: z.string().openapi({
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
  }),
);

registry.registerPath({
  method: 'post',
  path: '/api/login',
  tags: ['Login'],
  summary: 'Realiza login do usuário',
  description:
    'Autentica um usuário com email e senha, retornando um token JWT válido por 7 dias.',
  request: {
    body: {
      content: { 'application/json': { schema: loginRequestSchema } },
    },
  },
  responses: {
    200: {
      description: 'Login realizado com sucesso.',
      content: { 'application/json': { schema: loginResponseSchema } },
    },
    400: {
      description: 'Dados inválidos.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    401: {
      description: 'E-mail ou senha inválidos.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    429: {
      description: 'Muitas tentativas de login. Tente novamente mais tarde.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
});
