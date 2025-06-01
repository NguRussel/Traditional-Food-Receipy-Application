import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Assistant Service API',
      version: '1.0.0',
      description: 'API documentation for the AI Assistant Service, handling voice and text queries, recipe suggestions, cooking help, and ingredient substitutes, powered by Gemini and VAPI.',
      contact: {
        name: 'API Support',
        // url: 'http://www.example.com/support', // Optional
        // email: 'support@example.com', // Optional
      },
    },
    servers: [
      {
        url: `/api/v1/ai-assistant`, // Base path for general routes
        description: 'AI Assistant Service General Endpoints',
      },
      {
        url: `/api/v1/ai-assistant/admin`, // Base path for admin routes
        description: 'AI Assistant Service Admin Endpoints',
      }
    ],
    components: {
        schemas: {
            ErrorResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string', description: 'Error message' },
                    stack: { type: 'string', description: 'Error stack (in development)' }
                }
            },
            UserInputTextQuery: {
                type: 'object',
                required: ['query'],
                properties: {
                    query: { type: 'string', description: 'The text query from the user.' },
                    history: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                role: { type: 'string', enum: ['user', 'model'], description: 'Role in the conversation (user or model).' },
                                parts: { 
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            text: { type: 'string', description: 'Text part of the message.' }
                                        }
                                    } 
                                }
                            }
                        },
                        description: 'Optional. Conversation history for context.'
                    }
                }
            },
            AIResponse: {
                type: 'object',
                properties: {
                    response: { type: 'string', description: 'The AI generated response.' },
                    sessionId: { type: 'string', description: 'The session ID for this interaction.' }
                }
            },
            RecipeSuggestionRequest: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'User query for recipe types or ideas.'},
                    preferences: { type: 'string', description: 'User dietary preferences or restrictions.'},
                    ingredients: { type: 'array', items: { type: 'string' }, description: 'List of available ingredients.'}
                },
                example: {
                    query: "Quick lunch ideas",
                    preferences: "Vegetarian, gluten-free",
                    ingredients: ["tomato", "cucumber", "rice"]
                }
            },
            CookingHelpRequest: {
                type: 'object',
                required: ['question'],
                properties: {
                    recipeName: { type: 'string', description: 'Name of the recipe user needs help with.'},
                    step: { type: 'string', description: 'Specific step in the recipe.'},
                    question: { type: 'string', description: 'Users specific question for cooking help.'}
                }
            },
            IngredientSubstituteRequest: {
                type: 'object',
                required: ['ingredientToReplace'],
                properties: {
                    ingredientToReplace: { type: 'string', description: 'The ingredient user wants to substitute.'},
                    recipeContext: { type: 'string', description: 'Brief context of the recipe.'},
                    dietaryRestrictions: { type: 'string', description: 'Any dietary restrictions to consider.'}
                }
            },
            // Schemas for Admin Routes
            PaginationDetails: {
                type: 'object',
                properties: {
                    currentPage: { type: 'integer', example: 1 },
                    totalPages: { type: 'integer', example: 5 },
                    totalLogs: { type: 'integer', example: 100 }, 
                    pageSize: { type: 'integer', example: 20 }
                }
            },
            ConversationLogEntry: {
                type: 'object',
                properties: {
                    _id: { type: 'string', format: 'objectid', description: 'Log entry ID' },
                    clerkUserId: { type: 'string', description: 'Clerk User ID of the interacting user', nullable: true },
                    sessionId: { type: 'string', description: 'Session identifier for the interaction' },
                    interactionType: { type: 'string', enum: ['text-query', 'voice-transcript', 'recipe-suggestion', 'cooking-help', 'ingredient-substitute', 'vapi-call', 'other'] },
                    userInputSummary: { type: 'string', description: 'Summary of user input', nullable: true },
                    aiResponseSummary: { type: 'string', description: 'Summary of AI response', nullable: true },
                    vapiCallId: { type: 'string', description: 'VAPI call ID if applicable', nullable: true },
                    timestamp: { type: 'string', format: 'date-time', description: 'Timestamp of the interaction' },
                    processedSuccessfully: { type: 'boolean' },
                    durationMs: { type: 'integer', description: 'Duration of the interaction in milliseconds', nullable: true },
                    errorDetails: { type: 'string', description: 'Details of error if any', nullable: true },
                    metadata: { type: 'object', additionalProperties: true, description: 'Additional metadata', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            ConversationLogListResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/ConversationLogEntry' } },
                    pagination: { $ref: '#/components/schemas/PaginationDetails' },
                    filtersApplied: { type: 'object', additionalProperties: true, description: 'Filters that were applied to the query' }
                }
            },
            AIConfigurationEntry: {
                type: 'object',
                properties: {
                    _id: { type: 'string', format: 'objectid' },
                    key: { type: 'string', description: 'Unique key for the configuration' },
                    value: { type: 'object', additionalProperties: true, description: 'Value of the configuration (can be any type)' },
                    description: { type: 'string', nullable: true },
                    clerkUserIdLastUpdatedBy: { type: 'string', description: 'Clerk User ID of admin who last updated', nullable: true },
                    isActive: { type: 'boolean' },
                    tags: { type: 'array', items: { type: 'string' }, nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            AIConfigurationUpdateRequest: {
                type: 'object',
                required: ['key', 'value'],
                properties: {
                    key: { type: 'string', description: 'Configuration key to update or create.'},
                    value: { type: 'object', additionalProperties: true, description: 'New value for the configuration.'},
                    description: { type: 'string', nullable: true, description: 'Optional new description.'},
                    isActive: { type: 'boolean', nullable: true, description: 'Optional active status.'},
                    tags: { type: 'array', items: { type: 'string' }, nullable: true, description: 'Optional tags.'}
                }
            }
        },
        securitySchemes: {
            ClerkAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'x-user-id',
                description: "User identification via x-user-id header. Roles are passed in x-user-roles. This is a simplified representation of authentication handled by an API Gateway with Clerk."
            }
        }
    },
    // security: [
    //     {
    //         ClerkAuth: [] // Apply this security globally if all (or most) endpoints require it.
    //                      // Individual endpoints can override or specify their own security.
    //     }
    // ]
  },
  // Path to the API docs
  // Adjust this glob pattern to match your route files
  apis: [
    path.join(__dirname, './routes/*.ts'), 
    path.join(__dirname, './models/*.ts') // Include models if you define schemas there with JSDoc for Swagger
  ],
};

const swaggerSpecObject = swaggerJsdoc(options);

export { swaggerSpecObject }; 