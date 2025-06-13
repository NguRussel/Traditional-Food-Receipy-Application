import swaggerJSDoc, { OAS3Definition, OAS3Options } from 'swagger-jsdoc';

const swaggerDefinition: OAS3Definition = {
  openapi: '3.0.0',
  info: {
    title: 'Media Service API',
    version: '1.0.0',
    description: 'API for managing media files (images, videos, documents) including uploads to Firebase Storage.',
    contact: {
      name: 'API Support',
      // url: 'http://www.example.com/support',
      // email: 'support@example.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.MEDIA_SERVICE_PORT || 8005}/api/v1`,
      description: 'Development server',
    },
    // Add other servers like staging or production here
  ],
  components: {
    securitySchemes: {
      apiKeyAuth: { // Matches the name used in @swagger security tags
        type: 'apiKey',
        in: 'header',
        name: 'x-user-id', // Or your primary auth header like 'Authorization' for JWT Bearer
        description: 'User ID for basic authentication (simulated - actual auth via API Gateway). Provide x-user-id and optionally x-user-roles.'
      },
      // If you were using Bearer tokens, it would be:
      // bearerAuth: {
      //   type: 'http',
      //   scheme: 'bearer',
      //   bearerFormat: 'JWT',
      // },
    },
    schemas: {
      Media: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
          originalName: { type: 'string', example: 'my-recipe-image.jpg' },
          fileName: { type: 'string', example: 'images/recipe/uuid-my-recipe-image.webp' },
          firebaseUrl: { type: 'string', format: 'url', example: 'https://storage.googleapis.com/bucket/images/recipe/uuid-my-recipe-image.webp' },
          type: { type: 'string', enum: ['image', 'video', 'document'], example: 'image' },
          category: { type: 'string', enum: ['recipe', 'profile', 'verification', 'review'], example: 'recipe' },
          uploadedBy: { type: 'string', example: '60d0fe4f5311236168a109cb' }, // ObjectId as string
          size: { type: 'number', example: 102400 }, // in bytes
          mimeType: { type: 'string', example: 'image/webp' },
          status: { type: 'string', enum: ['active', 'flagged', 'deleted'], example: 'active' },
          flaggedReason: { type: 'string', nullable: true, example: 'Inappropriate content' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'fail' },
          message: { type: 'string', example: 'Resource not found' },
          stack: { type: 'string', example: 'Error: Resource not found at ...' , description: 'Present in development environment only'}
        },
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'status' },
                message: { type: 'string', example: 'Invalid moderation status.' },
              }
            }
          }
        }
      }
    },
  },
};

const swaggerOptions: OAS3Options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.ts', // Path to the API routes files
    './src/models/*.ts',   // Path to the models for schema definitions (if using @swagger tags there too)
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec; 