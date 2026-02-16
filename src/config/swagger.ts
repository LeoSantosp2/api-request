import swaggerJsDocs from 'swagger-jsdoc';

const swaggerOtions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Request',
      version: '1.0.0',
      description: 'API Request Documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },

  apis: ['./src/routes/*.ts'],
};

const swaggerDocs = swaggerJsDocs(swaggerOtions);

export default swaggerDocs;
