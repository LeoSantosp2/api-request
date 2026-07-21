import app from './app';

import env from './config/env';
import prisma from './config/prisma';

import logger from './utils/logger';

const PORT = env.API_PORT || 3000;

const server = app.listen(PORT, () => {
  logger.success(
    `server running at http://localhost:${PORT} [${env.NODE_ENV}]`,
  );
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(
      `Port ${PORT} is already in use. Choose another port or stop the process using it.`,
    );
  } else {
    logger.error('Failed to start server:', error);
  }

  process.exit(1);
});

const shutdown = (signal: string) => {
  logger.warn(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server stopped.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
