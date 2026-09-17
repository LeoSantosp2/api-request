import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

import env from '../config/env';

import { registry } from './registry';

import './auth';
import './common';
import './docs';
import './health';
import './users';

export const generateOpenApiDocument = () => {
  if (env.NODE_ENV === 'production') return;

  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'API Request',
      version: '1.0.0',
      description: 'API Request Documentation',
    },
    servers: [{ url: `http://localhost:${env.API_PORT}` }],
  });
};
