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
    tags: [
      {
        name: 'Movies',
        description: 'Movie management API',
      },
      {
        name: 'Reviews',
        description: 'Movie review management API',
      },
      {
        name: 'Auth',
        description: 'Authentication and Authorization',
      },
    ],
    components: {
      schemas: {
        Movie: {
          type: 'object',
          required: ['title', 'description', 'types'],
          properties: {
            id: {
              type: 'string',
              description: 'Automatically generated Mongoose ObjectId',
            },
            title: { type: 'string', description: 'Movie title' },
            description: {
              type: 'string',
              description: 'Movie description',
            },
            types: {
              type: 'array',
              items: { type: 'string' },
              description: 'Movie genres',
            },
            averageRating: {
              type: 'number',
              format: 'float',
              description: 'Average rating of the movie',
            },
            reviews: {
              type: 'array',
              items: { $ref: '#/components/schemas/Review' },
              description: 'List of reviews for the movie',
            },
          },
        },
        Review: {
          type: 'object',
          required: ['rating', 'content'],
          properties: {
            id: {
              type: 'string',
              description:
                'Automatically generated Mongoose ObjectId (subdocument)',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Rating given to the movie (1-5)',
            },
            content: { type: 'string', description: 'Review content' },
          },
        },
        NewMovie: {
          type: 'object',
          required: ['title', 'description', 'types'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            types: { type: 'array', items: { type: 'string' } },
          },
        },
        NewReview: {
          type: 'object',
          required: ['rating'],
          properties: {
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            content: {
              type: 'string',
              description: 'Optional review content (defaults to "")',
            },
          },
        },
        // Auth-related Schemas
        NewUser: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
        },
        UserLogin: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
        },
        AuthToken: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT token' },
          },
        },
      },
    },
  },
  apis: ['./src/controllers/*.js'], // path
});
