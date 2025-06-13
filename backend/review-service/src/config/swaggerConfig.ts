import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Review Service API',
      version: '1.0.0',
      description: 'API documentation for the Review Service, responsible for managing recipe reviews and ratings.',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.REVIEW_SERVICE_PORT || 8004}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: { // Arbitrary name for the security scheme
          type: 'apiKey',
          in: 'header',
          name: 'x-user-id', // Or your primary auth header like 'Authorization' for JWTs
          description: 'Requires x-user-id for identifying the user. For protected routes, x-user-roles may also be checked by the gateway/middleware.'
        }
      }
    },
    // security: [
    //   {
    //     ApiKeyAuth: [] // Apply ApiKeyAuth globally to all operations
    //   }
    // ]
  },
  // Path to the API docs
  // Looks for JSDoc comments in these files
  apis: ['./src/models/**/*.ts', './src/routes/**/*.ts'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 