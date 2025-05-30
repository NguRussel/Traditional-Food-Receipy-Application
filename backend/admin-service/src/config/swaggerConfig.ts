import path from 'path';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Admin Service API',
      version: '1.0.0',
      description: 'API documentation for the Admin Service, managing administrative users, roles, permissions, and system settings.',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.ADMIN_SERVICE_PORT || 8000}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { // Can be any name, typically "bearerAuth" or "Bearer"
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Optional, for documentation purposes
        },
      },
    },
    // security: [
    //   {
    //     bearerAuth: [], // Applies Bearer token security globally to all operations
    //   },
    // ], // We will apply security per-route for more control
  },
  // Paths to files containing OpenAPI definitions (JSDoc comments)
  apis: [
    path.resolve(__dirname, '../models/**/*.ts'),
    path.resolve(__dirname, '../routes/**/*.ts'),
    path.resolve(__dirname, '../controllers/**/*.ts'), // If you put JSDoc in controllers too
  ],
};

export default swaggerOptions; 