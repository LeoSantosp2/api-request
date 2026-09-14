import { z } from 'zod';

import { registry } from './registry';

const healthResponseSchema = registry.register(
  'HealthResponse',
  z.object({
    status: z.literal('ok').openapi({ example: 'ok' }),
  }),
);

registry.registerPath({
  method: 'get',
  path: '/api/health',
  tags: ['Health'],
  summary: 'Verifica o status da API',
  description:
    'Rota pública utilizada para checar se a API está no ar. Não requer autenticação.',
  responses: {
    200: {
      description: 'API disponível.',
      content: { 'application/json': { schema: healthResponseSchema } },
    },
  },
});
