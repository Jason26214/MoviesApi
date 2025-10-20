const swaggerJsDoc = require('swagger-jsdoc');

module.exports = swaggerJsDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie API',
      version: '0.0.1',
      description: 'example description',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'local dev server',
      },
    ],
  },
  apis: ['./src/controllers/*.js'], // path
});
