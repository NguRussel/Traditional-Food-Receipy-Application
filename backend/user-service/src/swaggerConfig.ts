import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Service API',
      version: '1.0.0',
      description: 'API documentation for the User Service of the Cameroonian Food Recipe Application',
      contact: {
        name: 'API Support',
        // url: 'http://www.example.com/support',
        // email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.USER_SERVICE_PORT || 8002}/api/v1`,
        description: 'Development server',
      },
      // Add other servers like staging or production here
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: { // Can be named arbitrarily, e.g. BearerAuth for JWT
          type: 'apiKey',
          in: 'header',
          name: 'x-user-id', // Or 'Authorization' for Bearer token
          description: 'User ID provided by API Gateway (simulate authentication). For admin actions, x-user-roles header with \'admin\' role is also expected.'
        }
      }
    },
    // security: [
    //   {
    //     ApiKeyAuth: [] 
    //   }
    // ]
  },
  // Path to the API docs
  // Looks for JSDoc comments in .ts files within routes and models
  apis: ['./src/routes/*.ts', './src/models/*.ts', './src/controllers/*.ts'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 