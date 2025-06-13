import swaggerJsdoc, { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Notification Service API',
            version: '1.0.0',
            description: 'API documentation for the AFRI-Plates Notification Service',
            contact: {
                name: 'API Support',
                url: 'https://your-support-url.com', // Replace with actual support URL
                email: 'support@example.com', // Replace with actual support email
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.NOTIFICATION_SERVICE_PORT || 8008}/api/v1`,
                description: 'Development server',
            },
            // Add other servers like staging or production here if needed
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: { // Arbitrary name for the security scheme
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-user-id', // Or your primary auth header like 'Authorization' for JWTs
                    description: 'Requires x-user-id and x-user-roles for most endpoints. API Gateway is expected to inject these headers after validating Clerk JWT.'
                }
            },
            schemas: { // Added schemas section for ErrorResponse
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        statusCode: {
                            type: 'integer',
                            example: 400
                        },
                        status: {
                            type: 'string',
                            example: 'fail'
                        },
                        message: {
                            type: 'string',
                            example: 'Invalid input data'
                        },
                        error: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    example: 'ValidationError'
                                },
                                message: {
                                    type: 'string',
                                    example: 'Invalid input data' // Or a more detailed error structure/string
                                }
                            }
                        },
                        stack: {
                            type: 'string',
                            description: 'Error stack trace (only in development)',
                            example: 'Error: Validation failed...\n    at ...'
                        }
                    }
                }
            },
            parameters: {
                MongoIdPathParam: {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Mongo DB Object ID',
                    schema: {
                        type: 'string',
                        pattern: '^[0-9a-fA-F]{24}$'
                    }
                },
                PageQueryParam: {
                    name: 'page',
                    in: 'query',
                    description: 'Page number for pagination',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 1,
                        minimum: 1
                    }
                },
                LimitQueryParam: {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of items per page',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 10,
                        minimum: 1,
                        maximum: 100
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Unauthorized - Authentication information is missing or invalid. Requires x-user-id and x-user-roles headers from API Gateway.',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            }
                        }
                    }
                },
                ForbiddenError: {
                    description: 'Forbidden - User does not have permission to perform this action.',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Not Found - The requested resource could not be found.',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            }
                        }
                    }
                },
                BadRequestError: {
                    description: 'Bad Request - The request was invalid or cannot be otherwise served. Check inputs.',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            }
                        }
                    }
                },
                InternalServerError: {
                    description: 'Internal Server Error - An unexpected error occurred on the server.',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            }
                        }
                    }
                }
            }
        },
        security: [
            {
                ApiKeyAuth: [] // Applies ApiKeyAuth globally to all operations that don\'t override it
            }
        ]
        // TODO: Add common components like schemas for responses (e.g., ErrorResponse)
    },
    // Paths to files containing OpenAPI definitions (JSDoc comments)
    apis: [
        './src/routes/*.ts', 
        './src/models/*.ts', // If you define JSDoc schemas in your model files
        './src/controllers/*.ts' // If you put detailed per-endpoint comments here
    ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec; 