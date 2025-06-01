import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Scanner Service API',
      version: '1.0.0',
      description: 'API documentation for the AFRI-Plates Scanner Service. Handles ingredient recognition from images and suggests recipes.',
      contact: {
        name: 'API Support',
        // url: 'http://www.example.com/support', // Optional
        // email: 'support@example.com' // Optional
      },
      license: {
        name: 'ISC',
        // url: 'https://opensource.org/licenses/ISC' // Optional
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.SCANNER_SERVICE_PORT || 8009}/api/v1`,
        description: 'Development server'
      },
      // Add production server URL when available
    ],
    // Components (schemas, securitySchemes) can be defined here or in JSDoc comments
    components: {
      securitySchemes: {
        // Based on our authMiddleware, we rely on headers set by API Gateway
        // For documentation purposes, we can describe these headers.
        // However, swagger-ui won't be able to use these directly for 'Try it out' 
        // without a more complex setup or by defining a bearerAuth/apiKey scheme if the gateway uses one.
        gatewayAuth: { // A descriptive name for the scheme
          type: 'apiKey', // Using apiKey as a way to describe header-based auth for documentation
          in: 'header',
          name: 'x-user-id', // Describe one of the headers
          description: 'User ID set by API Gateway after successful authentication. x-user-roles is also expected.'
        }
      },
      schemas: { // Define common schemas here
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { 
              type: 'string',
              description: 'A human-readable error message.'
            },
            errors: { // For validation errors from express-validator
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'field' },
                  value: { type: 'string', example: 'some value' },
                  msg: { type: 'string', example: 'Invalid value' },
                  path: { type: 'string', example: 'fieldName' },
                  location: { type: 'string', example: 'body' }
                }
              },
              nullable: true
            }
          }
        },
        IngredientList: {
          type: 'array',
          items: {
            type: 'string'
          },
          example: ['tomato', 'onion', 'garlic']
        }
        // Add other common schemas as needed
      },
      responses: { // Define common responses here
        BadRequest: {
          description: 'Bad Request - often due to invalid input.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        Unauthorized: {
          description: 'Unauthorized - missing or invalid authentication.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        InternalServerError: {
          description: 'Internal Server Error.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  // Path to the API docs (JSDoc comments)
  apis: [
    path.join(__dirname, './routes/*.ts'), 
    path.join(__dirname, './models/**/*.ts'), // If you add Mongoose models later
    path.join(__dirname, './controllers/**/*.ts') // For request/response body definitions
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  console.log(`Swagger docs available at /api-docs`);
}; 