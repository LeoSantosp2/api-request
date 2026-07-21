import { z } from 'zod';

import { userRequestSchema } from '../modules/users/user-schema';

import { bearerAuth, registry } from './registry';
import { errorResponseSchema, successMessageSchema } from './common';

const userResponseSchema = registry.register(
  'UserResponse',
  z.object({
    id: z.string().openapi({ example: 'eddcdbb6-0294-4f0e-959c-fea84cd687c4' }),
    first_name: z.string().openapi({ example: 'João' }),
    last_name: z.string().openapi({ example: 'Silva' }),
    email: z.string().openapi({ example: 'joao@email.com' }),
    created_at: z.iso
      .datetime()
      .openapi({ example: '2026-02-16T12:00:00.000Z' }),
    updated_at: z.iso
      .datetime()
      .openapi({ example: '2026-02-16T12:00:00.000Z' }),
  }),
);

registry.registerPath({
  method: 'get',
  path: '/api/users',
  tags: ['Users'],
  summary: 'Retorna todos os usuários',
  description:
    'Busca e retorna a lista completa de usuários cadastrados. Requer autenticação.',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: 'Lista de usuários retornada com sucesso.',
      content: { 'application/json': { schema: z.array(userResponseSchema) } },
    },
    401: {
      description: 'Autenticação obrigatória.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/users/{id}',
  tags: ['Users'],
  summary: 'Retorna um usuário',
  description: 'Busca e retorna um usuário. Requer autenticação.',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .openapi({ example: 'eddcdbb6-0294-4f0e-959c-fea84cd687c4' }),
    }),
  },
  responses: {
    200: {
      description: 'Usuário retornado com sucesso.',
      content: { 'application/json': { schema: userResponseSchema } },
    },
    401: {
      description: 'Autenticação obrigatória.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    404: {
      description: 'Usuário não encontrado.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/users',
  tags: ['Users'],
  summary: 'Cria um novo usuário',
  description: 'Cria e registra um novo usuário no sistema.',
  request: {
    body: {
      content: { 'application/json': { schema: userRequestSchema } },
    },
  },
  responses: {
    201: {
      description: 'Usuário criado com sucesso.',
      content: { 'application/json': { schema: successMessageSchema } },
    },
    400: {
      description: 'Dados inválidos ou email já cadastrado.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/users/{id}',
  tags: ['Users'],
  summary: 'Atualiza um usuário',
  description:
    'Atualiza os dados de um usuário existente. Requer autenticação.',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .openapi({ example: 'eddcdbb6-0294-4f0e-959c-fea84cd687c4' }),
    }),
    body: {
      content: { 'application/json': { schema: userRequestSchema } },
    },
  },
  responses: {
    200: {
      description: 'Usuário atualizado com sucesso.',
      content: { 'application/json': { schema: successMessageSchema } },
    },
    400: {
      description: 'Dados inválidos ou email já cadastrado.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    401: {
      description: 'Autenticação obrigatória.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    403: {
      description: 'Sem permissão para alterar este usuário.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    404: {
      description: 'Usuário não encontrado.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/users/{id}',
  tags: ['Users'],
  summary: 'Deleta um usuário',
  description: 'Remove um usuário do sistema. Requer autenticação.',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .openapi({ example: 'eddcdbb6-0294-4f0e-959c-fea84cd687c4' }),
    }),
  },
  responses: {
    200: {
      description: 'Usuário deletado com sucesso.',
      content: { 'application/json': { schema: successMessageSchema } },
    },
    401: {
      description: 'Autenticação obrigatória.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    403: {
      description: 'Sem permissão para deletar este usuário.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    404: {
      description: 'Usuário não encontrado.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
});
