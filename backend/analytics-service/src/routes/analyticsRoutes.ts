import express from 'express';
import { trackEvent } from '../controllers/analyticsController';
// import { protect } from '../middleware/authMiddleware'; // trackEvent can be public or protected based on needs

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics event tracking
 */

/**
 * @swagger
 * /track:
 *   post:
 *     summary: Track a user or system event
 *     tags: [Analytics]
 *     description: >
 *       Records an analytics event. Can be used for various tracking purposes like page views, 
 *       feature usage, user interactions, etc. The `userId` in the request body is optional 
 *       and can be used for anonymous events or when `x-user-id` header is not present/applicable.
 *       If the route is protected by `protect` middleware, `req.user.id` will be preferred.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrackEventRequest'
 *     responses:
 *       '201':
 *         description: Event tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrackEventResponse'
 *       '400':
 *         description: Invalid request payload (e.g., missing required fields, invalid format)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/track', trackEvent);

export default router; 