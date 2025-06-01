import express from 'express';
import {
  processVoiceQuery,
  processTextQuery,
  getAIRecipeSuggestions,
  getCookingHelp,
  getIngredientSubstitute,
} from '../controllers/aiAssistantController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: AI Assistant
 *   description: Endpoints for AI-powered assistance (text, voice, suggestions).
 */

/**
 * @openapi
 * /voice-query:
 *   post:
 *     tags: [AI Assistant]
 *     summary: Process a voice query (typically a webhook from VAPI).
 *     description: >
 *       This endpoint is designed to be called by a voice service like VAPI.
 *       The VAPI service would send a payload containing the voice transcript and other call details.
 *       The exact payload structure depends on VAPI's configuration.
 *       Authentication for this webhook should be configured within VAPI (e.g., API key or shared secret).
 *     requestBody:
 *       description: VAPI webhook payload. The structure is flexible and depends on VAPI.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               call: { type: 'object', description: "VAPI call object" }
 *               message: { type: 'object', description: "VAPI message object, may contain transcript" }
 *               // Add other potential VAPI payload fields as examples
 *           example:
 *             type: "transcript"
 *             transcript: "Hello, how do I cook ndole?"
 *             callId: "vapi-call-xxxxxxxx"
 *     responses:
 *       200:
 *         description: Successfully processed the VAPI webhook.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: 'string' }
 *                 processedTranscript: { type: 'string', nullable: true }
 *                 responseToVapi: { type: 'object', description: "Instructions or message for VAPI to act upon (structure defined by VAPI needs)" }
 *       500:
 *         description: Internal server error during webhook processing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/voice-query').post(processVoiceQuery);

/**
 * @openapi
 * /text-query:
 *   post:
 *     tags: [AI Assistant]
 *     summary: Process a text-based query using the AI model.
 *     security:
 *       - ClerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInputTextQuery'
 *     responses:
 *       200:
 *         description: Successful AI response to the text query.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIResponse'
 *       400:
 *         description: Bad request (e.g., missing query text).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized (Missing or invalid x-user-id/x-user-roles headers).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/text-query').post(protect, processTextQuery);

/**
 * @openapi
 * /recipe-suggestions:
 *   post:
 *     tags: [AI Assistant]
 *     summary: Get AI-powered recipe suggestions.
 *     security:
 *       - ClerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecipeSuggestionRequest'
 *     responses:
 *       200:
 *         description: Successfully retrieved recipe suggestions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions: { type: 'string', description: "AI generated recipe suggestions as a formatted string or JSON string." }
 *                 sessionId: { type: 'string' }
 *       400:
 *         description: Bad request (e.g., missing query or ingredients).
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.route('/recipe-suggestions').post(protect, getAIRecipeSuggestions);

/**
 * @openapi
 * /cooking-help:
 *   post:
 *     tags: [AI Assistant]
 *     summary: Get cooking assistance from the AI.
 *     security:
 *       - ClerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CookingHelpRequest'
 *     responses:
 *       200:
 *         description: Successfully received cooking help.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIResponse'
 *       400:
 *         description: Bad request (e.g., missing question).
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.route('/cooking-help').post(protect, getCookingHelp);

/**
 * @openapi
 * /ingredient-substitute:
 *   post:
 *     tags: [AI Assistant]
 *     summary: Get AI suggestions for ingredient substitutes.
 *     security:
 *       - ClerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IngredientSubstituteRequest'
 *     responses:
 *       200:
 *         description: Successfully retrieved ingredient substitutes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 substitutes: { type: 'string', description: "AI generated ingredient substitutes as a formatted string or JSON string." }
 *                 sessionId: { type: 'string' }
 *       400:
 *         description: Bad request (e.g., missing ingredientToReplace).
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.route('/ingredient-substitute').post(protect, getIngredientSubstitute);

export default router; 