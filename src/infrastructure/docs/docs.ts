import { registry } from './registry';
import { errorResponseSchema } from './common';

registry.registerPath({
  method: 'get',
  path: '/api/docs.json',
  tags: ['Docs'],
  summary: 'Retorna o documento OpenAPI',
  description:
    'Retorna a especificação OpenAPI da API em JSON, a mesma consumida pelo Swagger UI em `/api/docs`. Útil para importar a API em clientes como Insomnia e Postman ou para gerar SDKs. Rota pública, não requer autenticação. Não é registrada quando `NODE_ENV` é `production`, assim como o próprio `/api/docs`.',
  responses: {
    200: {
      description: 'Documento OpenAPI retornado com sucesso.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    },
    404: {
      description: 'Rota não registrada neste ambiente.',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
});
