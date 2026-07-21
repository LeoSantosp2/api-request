import { z } from 'zod';

import { registry } from './registry';

export const errorResponseSchema = registry.register(
  'ErrorResponse',
  z.object({
    status: z.literal('error').openapi({ example: 'error' }),
    message: z.string().openapi({ example: 'Mensagem de erro.' }),
  }),
);

export const successMessageSchema = registry.register(
  'SuccessResponse',
  z.object({
    status: z.literal('success').openapi({ example: 'success' }),
    message: z.string().openapi({ example: 'Operação realizada com sucesso.' }),
  }),
);
