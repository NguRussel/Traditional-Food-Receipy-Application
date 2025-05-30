import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Regional Service API',
            version: '1.0.0',
            description: 'API documentation for the Regional Service, managing regions, tribes, and related cultural information.',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 8007}/api/v1`,
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: { // For simulating API Gateway auth using x-user-id and x-user-roles
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-user-id' // Primary header for identification, x-user-roles also expected
                }
            }
        },
        security: [
            {
                ApiKeyAuth: [] // Applying to all secure endpoints; actual enforcement by middleware
            }
        ]
    },
    apis: [
        './src/routes/*.ts', 
        './src/models/*.ts'
    ], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 