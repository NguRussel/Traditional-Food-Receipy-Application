import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Analytics Service API',
      version: '1.0.0',
      description: 'API for tracking user events and providing analytics data for AFRI-Plates.',
      contact: {
        name: 'API Support',
        // url: 'http://www.example.com/support',
        // email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.ANALYTICS_SERVICE_PORT || 8011}/api/v1`,
        description: 'Development server',
      },
      // TODO: Add production server URL when available
    ],
    components: {
      securitySchemes: {
        // Although primary auth is by API Gateway, this documents header expectations for services
        gatewayAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-id', // Primary identifier, can also list x-user-roles
          description: 'User ID and roles passed by API Gateway after Clerk authentication. \nExample x-user-id: user_123abc, x-user-roles: user,editor'
        }
      },
      schemas: {
        // === Generic Schemas ===
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Error message' },
            errors: { 
              type: 'array',
              items: { type: 'object' },
              description: 'Array of validation errors or other specific error details'
            },
            stack: { type: 'string', description: 'Error stack trace (in development)' }
          },
          required: ['message'],
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }, // Can be more specific or use oneOf/anyOf for different data types
          },
        },
        // === Analytics Schemas ===
        AnalyticsEvent: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'objectid', description: 'Event ID', readOnly: true },
            eventType: { type: 'string', description: 'Type of the event (e.g., page_view, recipe_liked)' },
            userId: { type: 'string', format: 'objectid', description: 'ID of the user associated with the event (optional)' },
            sessionId: { type: 'string', description: 'Session identifier for the event' },
            data: { type: 'object', additionalProperties: true, description: 'Arbitrary data associated with the event' },
            timestamp: { type: 'string', format: 'date-time', description: 'Timestamp of when the event occurred' },
            createdAt: { type: 'string', format: 'date-time', description: 'Timestamp of when the event was recorded', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', description: 'Timestamp of when the event was last updated', readOnly: true },
          },
          required: ['eventType', 'sessionId', 'data', 'timestamp'],
        },
        TrackEventRequest: {
          type: 'object',
          properties: {
            eventType: { type: 'string', description: 'Type of the event', example: 'page_view' },
            sessionId: { type: 'string', description: 'Current session ID', example: 'abcdef123456' },
            data: { 
              type: 'object', 
              description: 'Event-specific data payload', 
              example: { page: '/home', duration: 120 }
            },
            timestamp: { type: 'string', format: 'date-time', description: 'Optional: Timestamp of the event (ISO8601), defaults to now if not provided', example: '2024-01-01T12:00:00.000Z' },
            userId: { type: 'string', description: 'Optional: User ID if not an authenticated event or for overriding', example: 'user_abcdef123456' }
          },
          required: ['eventType', 'sessionId', 'data'],
        },
        TrackEventResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Event tracked successfully' },
            data: { '$ref': '#/components/schemas/AnalyticsEvent' }
          }
        },
        // --- Admin Endpoint Schemas (mostly placeholders for now) ---
        AnalyticsDashboardData: {
          type: 'object',
          properties: {
            // Define properties for dashboard data, e.g., totalEvents, activeUsers, eventCountsByType
            message: { type: 'string', example: 'Analytics dashboard data (to be implemented)' }
          }
        },
        PopularRecipesData: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Popular recipes analytics (to be implemented)' }
            }
        },
        UserBehaviorData: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'User behavior analytics (to be implemented)' }
            }
        },
        RevenueData: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Revenue analytics (to be implemented)' }
            }
        },
        UserEngagementData: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'User engagement metrics (to be implemented)' }
            }
        },
        ContentPerformanceData: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Content performance analytics (to be implemented)' }
            }
        },
        GenerateReportRequest: {
            type: 'object',
            properties: {
                reportType: { type: 'string', example: 'user_activity' },
                // Add other report parameters like dateRange, filters etc.
            }
        },
        GenerateReportResponse: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Custom report generation (to be implemented)' },
                // Could include a link to the report or the report data itself
            }
        }
      }
    },
    // security: [
    //   {
    //     gatewayAuth: [] // Apply the gatewayAuth security scheme globally if needed by default
    //   }
    // ]
  },
  apis: [
    './src/routes/**/*.ts', // Path to the API routes files
    './src/models/**/*.ts' // Path to model files (if they contain JSDoc for schemas)
  ],
};

export const swaggerSpecObject = swaggerJSDoc(swaggerOptions); 