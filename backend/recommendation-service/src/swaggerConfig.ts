import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Recommendation Service API',
      version: '1.0.0',
      description: 'API documentation for the Recommendation Service, responsible for recipe recommendations and user interaction tracking.',
      contact: {
        name: 'API Support',
        // url: 'http://www.example.com/support', // Optional
        email: 'support@example.com', // Optional
      },
    },
    servers: [
      {
        url: 'http://localhost:8006/api/v1', // Adjust port and base path as needed
        description: 'Development server',
      },
      // You can add more servers here (e.g., staging, production)
    ],
    components: {
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
            },
            errors: { // For validation errors from express-validator
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'field' },
                  value: { type: 'string', example: 'bad_value' },
                  msg: { type: 'string' },
                  path: { type: 'string' },
                  location: { type: 'string' , example: 'body'}
                }
              }
            }
          },
          required: ['success', 'message'],
        },
        SuccessMessageResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string' },
            },
            required: ['success', 'message'],
        },
        // Common query parameters for pagination
        PageQueryParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination.',
          required: false,
          schema: {
            type: 'integer',
            default: 1,
            minimum: 1,
          },
        },
        LimitQueryParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page.',
          required: false,
          schema: {
            type: 'integer',
            default: 10,
            minimum: 1,
            maximum: 100,
          },
        },
      },
      securitySchemes: {
        ApiKeyAuth: { // For x-user-id, x-user-roles via headers
          type: 'apiKey',
          in: 'header',
          name: 'x-user-id', // Primary header for authentication
          description: 'User ID for authentication. In a real scenario, an API Gateway would set this after validating a JWT. For simulating roles, also provide x-user-roles (comma-separated).'
        },
        // If you had a Bearer token auth, it would be defined here too:
        // BearerAuth: {
        //   type: 'http',
        //   scheme: 'bearer',
        //   bearerFormat: 'JWT',
        // }
      },
    },
    // security: [ { ApiKeyAuth: [] } ], // Global security, can be overridden at operation level
  },
  // Path to the API docs
  // Looks for JSDoc comments in TS files under src/routes and src/models
  apis: ['./src/routes/**/*.ts', './src/models/**/*.ts', './src/controllers/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 