import express from 'express';
import {
  getAIAssistantUsageAnalytics,
  updateAIAssistantConfiguration,
  getAIAssistantConversationLogs,
} from '../controllers/aiAssistantController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: AI Assistant Admin
 *   description: Administration endpoints for the AI Assistant service.
 * security:
 *   - ClerkAuth: [] # Apply ClerkAuth globally to all routes in this file
 */

/**
 * @openapi
 * /usage-analytics:
 *   get:
 *     tags: [AI Assistant Admin]
 *     summary: Get AI assistant usage analytics.
 *     description: Retrieves aggregated analytics data about AI assistant interactions. Supports timeframe filtering.
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: ['24h', '7d', '30d', 'all', 'custom']
 *           default: 'all'
 *         description: The timeframe for analytics (e.g., '24h', '7d', '30d', 'all', or 'custom').
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-iso
 *         description: Start date for custom timeframe (YYYY-MM-DD). Required if timeframe is 'custom'.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-iso
 *         description: End date for custom timeframe (YYYY-MM-DD). Required if timeframe is 'custom'.
 *     responses:
 *       200:
 *         description: Successfully fetched AI usage analytics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: 'string' }
 *                 timeframe: { type: 'string' }
 *                 appliedDateFilter: { type: 'object', additionalProperties: true, description: 'Actual date filter applied based on timeframe.'}
 *                 analytics: {
 *                     type: 'object',
 *                     properties:
 *                         totalInteractions: { type: 'integer' },
 *                         interactionsByType: { type: 'array', items: { type: 'object', properties: { type: {type: 'string'}, count: {type: 'integer'}} } },
 *                         successStatus: { type: 'array', items: { type: 'object', properties: { status: {type: 'string'}, count: {type: 'integer'}} } },
 *                         activeUsersCount: { type: 'integer' },
 *                         activeSessionsCount: { type: 'integer' }
 *                 }
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (User is not an admin).
 *       500:
 *         description: Internal server error.
 */
router.route('/usage-analytics').get(protect, authorize('admin', 'super_admin'), getAIAssistantUsageAnalytics);

/**
 * @openapi
 * /configuration:
 *   put:
 *     tags: [AI Assistant Admin]
 *     summary: Update or create an AI assistant configuration.
 *     description: Allows admins to update existing AI configurations or create new ones by specifying a key and value.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIConfigurationUpdateRequest'
 *     responses:
 *       200:
 *         description: Configuration updated/created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: 'string' }
 *                 data: { $ref: '#/components/schemas/AIConfigurationEntry' }
 *       400:
 *         description: Bad request (e.g., missing key or value).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       409:
 *         description: Conflict (e.g. if key was meant to be unique and an unexpected state occurred).
 *       500:
 *         description: Internal server error.
 */
router.route('/configuration').put(protect, authorize('admin', 'super_admin'), updateAIAssistantConfiguration);

/**
 * @openapi
 * /conversation-logs:
 *   get:
 *     tags: [AI Assistant Admin]
 *     summary: Get AI assistant conversation logs.
 *     description: Retrieves a paginated list of conversation logs, with support for various filters.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: 'integer', default: 1 }
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema: { type: 'integer', default: 20 }
 *         description: Number of logs per page.
 *       - in: query
 *         name: clerkUserId
 *         schema: { type: 'string' }
 *         description: Filter by Clerk User ID.
 *       - in: query
 *         name: sessionId
 *         schema: { type: 'string' }
 *         description: Filter by session ID.
 *       - in: query
 *         name: interactionType
 *         schema: { type: 'string', enum: ['text-query', 'voice-transcript', 'recipe-suggestion', 'cooking-help', 'ingredient-substitute', 'vapi-call', 'other'] }
 *         description: Filter by interaction type.
 *       - in: query
 *         name: vapiCallId
 *         schema: { type: 'string' }
 *         description: Filter by VAPI call ID.
 *       - in: query
 *         name: processedSuccessfully
 *         schema: { type: 'boolean' }
 *         description: Filter by success status (true or false).
 *       - in: query
 *         name: startDate
 *         schema: { type: 'string', format: 'date-iso' }
 *         description: Filter logs from this date (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         schema: { type: 'string', format: 'date-iso' }
 *         description: Filter logs up to this date (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Successfully fetched conversation logs.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationLogListResponse' 
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.route('/conversation-logs').get(protect, authorize('admin', 'super_admin'), getAIAssistantConversationLogs);

export default router; 