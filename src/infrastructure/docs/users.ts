import { z } from 'zod';

import {
  userRequestSchema,
  updateRequestSchema,
} from '../../domain/schemas/user.schema';

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

const internalErrorResponse = {
  description: 'Erro interno do servidor.',
  content: { 'application/json': { schema: errorResponseSchema } },
};

const unauthorizedResponse = {
  description: 'Token ausente, inválido ou expirado.',
  content: { 'application/json': { schema: errorResponseSchema } },
};

const idParam = z.object({
  id: z.string().openapi({ example: 'eddcdbb6-0294-4f0e-959c-fea84cd687c4' }),
});

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
    401: unauthorizedResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/users/{id}',
  tags: ['Users'],
  summary: 'Retorna um usuário',
  description:
    'Busca e retorna um usuário. Requer autenticação e o usuário só pode consultar os próprios dados. Retorna `null` caso o registro não exista.',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: idParam,
  },
  responses: {
    200: {
      description:
        'Usuário retornado com sucesso, ou `null` caso não exista um registro com o id informado.',
      content: {
        'application/json': { schema: userResponseSchema.nullable() },
      },
    },
    401: unauthorizedResponse,
    403: {
      description: 'Sem permissão para listar este usuário.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/users',
  tags: ['Users'],
  summary: 'Cria um novo usuário',
  description:
    'Cria e registra um novo usuário no sistema. Rota pública, não requer autenticação. A rota é limitada a 5 tentativas a cada 15 minutos.',
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
    429: {
      description: 'Muitas tentativas de cadastro. Tente novamente mais tarde.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/users/{id}',
  tags: ['Users'],
  summary: 'Atualiza um usuário',
  description:
    'Atualiza o nome e o sobrenome de um usuário existente. Requer autenticação e o usuário só pode alterar os próprios dados.',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: idParam,
    body: {
      content: { 'application/json': { schema: updateRequestSchema } },
    },
  },
  responses: {
    204: {
      description: 'Usuário atualizado com sucesso.',
    },
    400: {
      description: 'Dados inválidos.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    401: unauthorizedResponse,
    403: {
      description: 'Sem permissão para alterar este usuário.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/users/{id}',
  tags: ['Users'],
  summary: 'Deleta um usuário',
  description:
    'Remove um usuário do sistema. Requer autenticação e o usuário só pode deletar a própria conta.',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: idParam,
  },
  responses: {
    204: {
      description: 'Usuário deletado com sucesso.',
    },
    401: unauthorizedResponse,
    403: {
      description: 'Sem permissão para deletar este usuário.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    500: internalErrorResponse,
  },
});
