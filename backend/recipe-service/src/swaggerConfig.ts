import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cameroonian Food Recipe API - Recipe Service',
      version: '1.0.0',
      description: 
        'API documentation for the Recipe Service. ' +
        'This service handles all aspects of recipe management, including creation, retrieval, searching, and administration.',
      contact: {
        name: 'API Support',
        // url: 'http://www.example.com/support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:8001/api/v1', // Adjust if your base URL or port is different
        description: 'Development server for Recipe Service',
      },
      // You can add more servers here (e.g., staging, production)
    ],
    components: {
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'field' },
                  value: { type: 'string', example: 'invalid' },
                  msg: { type: 'string' },
                  path: { type: 'string' },
                  location: { type: 'string' }
                }
              }
            }
          },
        },
        PaginationData: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer', example: 1 },
            totalPages: { type: 'integer', example: 5 },
            totalItems: { type: 'integer', example: 48 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
        SuccessMessageResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: "Operation successful" },
            data: { type: 'object', nullable: true },
          },
        },
        // Recipe, Ingredient schemas will be defined via JSDoc in models/Recipe.ts
        // RecipeInput, RecipeUpdateInput, RejectRecipeInput will be in route files.
      },
      parameters: {
        PageQueryParam: {
          name: 'page',
          in: 'query',
          required: false,
          description: 'Page number for pagination.',
          schema: { type: 'integer', default: 1, minimum: 1 },
        },
        LimitQueryParam: {
          name: 'limit',
          in: 'query',
          required: false,
          description: 'Number of items per page.',
          schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
        },
      },
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-id',
          description: 'User ID token for authentication. Roles are passed in x-user-roles.',
        },
      },
    },
    // Global security can be defined here if all/most endpoints require it
    // security: [
    //   { ApiKeyAuth: [] }
    // ],
  },
  apis: [
    './src/routes/**/*.ts', 
    './src/models/**/*.ts',
    // Add controllers if they also have JSDoc for components: './src/controllers/**/*.ts',
  ], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 