import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

function setUpSwagger({ app }: { app: express.Application }): void {
  if (!app) return;

  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Castler V1 Reports',
      version: '1.0.0',
      description: 'Api Specification for V1 Reports',
      license: {
        name: 'Licensed Under MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'JSONPlaceholder',
        url: 'https://jsonplaceholder.typicode.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Current server',
      },
    ],
    tags: [
      {
        name: 'Report Controller',
        description: 'Everything about Reports',
      },
      {
        name: 'Template Controller',
        description: 'Access to Templates',
      },
    ],
    produces: ['application/json'],
    schemes: ['http', 'https'],
    components: {
      securitySchemes: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
  };

  const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['./src/**/*.ts'],
  };

  const swaggerSpec = swaggerJSDoc(options);
  app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export default setUpSwagger;
