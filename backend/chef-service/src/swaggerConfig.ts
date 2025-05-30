import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chef Service API',
      version: '1.0.0',
      description: 'API documentation for the Cameroonian Food Recipe Application - Chef Service',
      contact: {
        name: 'API Support',
        // url: 'http://www.example.com/support', // Optional
        email: 'support@example.com', // Optional
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8003}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
        // securitySchemes: { // Optional: Add if you have auth like Bearer token
        //   bearerAuth: {
        //     type: 'http',
        //     scheme: 'bearer',
        //     bearerFormat: 'JWT',
        //   }
        // },
        schemas: {
            // JSDoc comments in model files define schemas
        }
    },
    // security: [{ // Optional: Define global security if needed
    //   bearerAuth: []
    // }]
  },
  // Paths to the API docs. These should point to files with JSDoc comments from the project root.
  // Assuming this file (swaggerConfig.ts) is in src/, and will be compiled to dist/.
  // swagger-jsdoc will run from dist/swaggerConfig.js.
  apis: [
    path.resolve(__dirname, '../src/models/**/*.ts'), 
    path.resolve(__dirname, '../src/routes/**/*.ts'),
    // If your compiled files are in `dist` and this `swaggerConfig.js` is also in `dist`,
    // then __dirname is `dist`. So `../src` correctly points to the `src` directory.
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 