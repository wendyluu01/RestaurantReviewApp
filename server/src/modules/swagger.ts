const swaggerUi = require('swagger-ui-express');
const swaggereJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    info: {
      title: 'API DOCUMENTATION',
      version: '1.0.0',
      description: 'Automated API docs with express'
    },
    host: 'localhost:3100/api/v1',
    basePath: '/',
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        scheme: 'bearer',
        description: 'Token from LOGIN API in Bearer TOKEN format',
        in: 'header'
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/v1/*.ts']
};

const specs = swaggereJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
