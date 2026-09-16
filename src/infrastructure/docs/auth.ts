import { z } from 'zod';

import { loginRequestSchema } from '../../domain/schemas/login.schema';
import { refreshTokenSchema } from '../../domain/schemas/refresh.token.schema';

import { registry } from './registry';
import { errorResponseSchema } from './common';

const accessTokenExample = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const refreshTokenExample =
  '9f2c1d4b8a7e6f3c0b5d2a9e8c7f4b1d6a3e0c9f2b5d8a1e4c7f0b3d6a9e2c5f';

const loginResponseSchema = registry.register(
  'LoginResponse',
  z.object({
    id: z.string().openapi({ example: 'eddcdbb6-0294-4f0e-959c-fea84cd687c4' }),
    email: z.string().openapi({ example: 'joao@email.com' }),
    accessToken: z.string().openapi({ example: accessTokenExample }),
    refreshToken: z.string().openapi({ example: refreshTokenExample }),
  }),
);

const refreshTokenResponseSchema = registry.register(
  'RefreshTokenResponse',
  z.object({
    accessToken: z.string().openapi({ example: accessTokenExample }),
    refreshToken: z.string().openapi({ example: refreshTokenExample }),
  }),
);

const internalErrorResponse = {
  description: 'Erro interno do servidor.',
  content: { 'application/json': { schema: errorResponseSchema } },
};

const invalidDataResponse = {
  description: 'Dados inválidos.',
  content: { 'application/json': { schema: errorResponseSchema } },
};

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Auth'],
  summary: 'Realiza login do usuário',
  description:
    'Autentica um usuário com email e senha, retornando um access token JWT e um refresh token. A expiração do access token é definida pela variável de ambiente TOKEN_EXPIRATION e a do refresh token, em dias, por REFRESH_TOKEN_EXPIRATION. A rota é limitada a 10 tentativas a cada 15 minutos.',
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
    400: invalidDataResponse,
    401: {
      description: 'E-mail ou senha inválidos.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    429: {
      description: 'Muitas tentativas de login. Tente novamente mais tarde.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/refresh-token',
  tags: ['Auth'],
  summary: 'Renova o access token',
  description:
    'Troca um refresh token válido por um novo access token e um novo refresh token. O refresh token enviado é revogado no processo (rotação), portanto só pode ser utilizado uma única vez. Rota pública, não requer autenticação.',
  request: {
    body: {
      content: { 'application/json': { schema: refreshTokenSchema } },
    },
  },
  responses: {
    200: {
      description: 'Tokens renovados com sucesso.',
      content: { 'application/json': { schema: refreshTokenResponseSchema } },
    },
    400: invalidDataResponse,
    401: {
      description: 'Refresh token inválido, revogado ou expirado.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    404: {
      description: 'Usuário inválido.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/logout',
  tags: ['Auth'],
  summary: 'Realiza logout do usuário',
  description:
    'Revoga o refresh token informado, encerrando a sessão à qual ele pertence. Os access tokens já emitidos continuam válidos até expirarem. Rota pública, não requer autenticação.',
  request: {
    body: {
      content: { 'application/json': { schema: refreshTokenSchema } },
    },
  },
  responses: {
    204: {
      description: 'Logout realizado com sucesso.',
    },
    400: invalidDataResponse,
    401: {
      description: 'Token inválido.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    500: internalErrorResponse,
  },
});
