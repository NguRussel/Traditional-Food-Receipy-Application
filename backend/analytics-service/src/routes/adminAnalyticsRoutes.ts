import express from 'express';
import {
  getAnalyticsDashboard,
  getPopularRecipesAnalytics,
  getUserBehaviorAnalytics,
  getRevenueAnalytics,
  getUserEngagementMetrics,
  getContentPerformance,
  generateCustomReport,
} from '../controllers/analyticsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Analytics
 *   description: Analytics data retrieval and reporting for administrators.
 * components:
 *   securitySchemes:
 *     AdminAuth:
 *       $ref: '#/components/securitySchemes/gatewayAuth' # Referencing from swaggerConfig
 */

// All routes in this file will be protected and require admin role
router.use(protect);
router.use(authorize('admin')); // Assuming 'admin' is the role string for administrators

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get analytics dashboard data
 *     tags: [Admin Analytics]
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       '200':
 *         description: Dashboard data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyticsDashboardData'
 *       '401':
 *         description: Not authorized, essential headers missing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden, user role not authorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/dashboard', getAnalyticsDashboard);

/**
 * @swagger
 * /admin/recipes/popular:
 *   get:
 *     summary: Get popular recipes analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       '200':
 *         description: Popular recipes analytics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PopularRecipesData' 
 *       '401':
 *         description: Not authorized.
 *       '403':
 *         description: Forbidden.
 *       '500':
 *         description: Internal server error.
 */
router.get('/recipes/popular', getPopularRecipesAnalytics);

/**
 * @swagger
 * /admin/users/behavior:
 *   get:
 *     summary: Get user behavior analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       '200':
 *         description: User behavior analytics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserBehaviorData'
 *       '401': { description: "Not authorized" }
 *       '403': { description: "Forbidden" }
 *       '500': { description: "Internal server error" }
 */
router.get('/users/behavior', getUserBehaviorAnalytics);

/**
 * @swagger
 * /admin/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       '200':
 *         description: Revenue analytics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RevenueData'
 *       '401': { description: "Not authorized" }
 *       '403': { description: "Forbidden" }
 *       '500': { description: "Internal server error" }
 */
router.get('/revenue', getRevenueAnalytics);

/**
 * @swagger
 * /admin/engagement:
 *   get:
 *     summary: Get user engagement metrics
 *     tags: [Admin Analytics]
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       '200':
 *         description: User engagement metrics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserEngagementData'
 *       '401': { description: "Not authorized" }
 *       '403': { description: "Forbidden" }
 *       '500': { description: "Internal server error" }
 */
router.get('/engagement', getUserEngagementMetrics);

/**
 * @swagger
 * /admin/content-performance:
 *   get:
 *     summary: Get content performance analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       '200':
 *         description: Content performance analytics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContentPerformanceData'
 *       '401': { description: "Not authorized" }
 *       '403': { description: "Forbidden" }
 *       '500': { description: "Internal server error" }
 */
router.get('/content-performance', getContentPerformance);

/**
 * @swagger
 * /admin/reports/generate:
 *   post:
 *     summary: Generate a custom analytics report
 *     tags: [Admin Analytics]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       description: Parameters for generating the custom report.
 *       required: false # Or true, depending on whether parameters are mandatory
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateReportRequest'
 *     responses:
 *       '200':
 *         description: Custom report generated successfully (or job initiated).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerateReportResponse'
 *       '400':
 *         description: Invalid report parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401': { description: "Not authorized" }
 *       '403': { description: "Forbidden" }
 *       '500': { description: "Internal server error" }
 */
router.post('/reports/generate', generateCustomReport);

export default router; 