import { z } from 'zod';

import { registry } from './registry';

export const errorResponseSchema = registry.register(
  'ErrorResponse',
  z.object({
    status: z.literal('error').openapi({ example: 'error' }),
    message: z.string().openapi({ example: 'Mensagem de erro.' }),
    details: z
      .array(
        z
          .object({
            code: z.string().openapi({ example: 'too_small' }),
            path: z
              .array(z.union([z.string(), z.number()]))
              .openapi({ example: ['firstName'] }),
            message: z
              .string()
              .openapi({ example: 'O nome não pode estar vazio.' }),
          })
          .loose(),
      )
      .optional()
      .openapi({
        description:
          'Presente apenas em erros de validação: lista os problemas encontrados em cada campo do body.',
      }),
  }),
);

export const successMessageSchema = registry.register(
  'SuccessResponse',
  z.object({
    status: z.literal('success').openapi({ example: 'success' }),
    message: z.string().openapi({ example: 'Operação realizada com sucesso.' }),
  }),
);
