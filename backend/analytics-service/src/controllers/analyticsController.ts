import { Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import asyncHandler from '../middleware/asyncHandler';
import AnalyticsEvent from '../models/AnalyticsEvent';
import { IAuthRequest } from '../middleware/authMiddleware'; // For req.user type
import mongoose from 'mongoose';

/**
 * @desc    Track a user or system event
 * @route   POST /api/v1/analytics/track
 * @access  Public (or Protected if specific events need user context implicitly)
 */
export const trackEvent = [
  // Validation middleware
  body('eventType').notEmpty().withMessage('Event type is required').trim().escape(),
  body('sessionId').notEmpty().withMessage('Session ID is required').trim().escape(),
  body('data').notEmpty().withMessage('Event data is required'), // Basic check, could be more specific if data structure is known
  body('timestamp').optional().isISO8601().toDate().withMessage('Invalid timestamp format'),
  body('userId').optional().trim().escape(), // Optional userId from body if not relying on req.user

  asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      eventType,
      sessionId,
      data,
      timestamp,
      userId: bodyUserId // userId from request body
    } = req.body;

    // Determine the userId to store:
    // 1. Use userId from authenticated user (req.user) if available (route is protected)
    // 2. Else, use userId from request body if provided
    // 3. Else, it remains undefined (for truly anonymous events)
    let finalUserId: mongoose.Types.ObjectId | undefined = undefined;
    if (req.user && req.user.id) {
        try {
            finalUserId = new mongoose.Types.ObjectId(req.user.id);
        } catch (error) {
            console.error('Error converting req.user.id to ObjectId:', error);
            // Potentially handle this error, e.g. by not setting userId or returning an error
        }
    } else if (bodyUserId) {
        try {
            finalUserId = new mongoose.Types.ObjectId(bodyUserId);
        } catch (error) {
            console.error('Error converting bodyUserId to ObjectId:', error);
            // Potentially handle this error
        }
    }

    try {
      const newEvent = await AnalyticsEvent.create({
        eventType,
        sessionId,
        data,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        userId: finalUserId,
      });

      res.status(201).json({
        success: true,
        message: 'Event tracked successfully',
        data: newEvent,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
      // Pass to global error handler, or handle more specifically
      next(error); 
    }
  }),
];

// Placeholder for Admin: Get analytics dashboard
export const getAnalyticsDashboard = asyncHandler(async (req: IAuthRequest, res: Response) => {
  // TODO: Implement logic to aggregate data for dashboard
  // This would likely involve multiple queries and data transformations
  res.status(200).json({ message: 'Analytics dashboard data (to be implemented)' });
});

// Placeholder for Admin: Get popular recipes analytics
export const getPopularRecipesAnalytics = asyncHandler(async (req: IAuthRequest, res: Response) => {
  // TODO: Query AnalyticsEvent for recipe view/interaction events
  // Aggregate by recipeId, count occurrences, sort by popularity
  res.status(200).json({ message: 'Popular recipes analytics (to be implemented)' });
});

// Placeholder for Admin: Get user behavior analytics
export const getUserBehaviorAnalytics = asyncHandler(async (req: IAuthRequest, res: Response) => {
  // TODO: Query AnalyticsEvent for user-specific actions
  // Could involve path analysis, feature usage, etc.
  res.status(200).json({ message: 'User behavior analytics (to be implemented)' });
});

// Placeholder for Admin: Get revenue analytics
export const getRevenueAnalytics = asyncHandler(async (req: IAuthRequest, res: Response) => {
  // TODO: Query for events related to purchases or subscriptions (if applicable)
  res.status(200).json({ message: 'Revenue analytics (to be implemented)' });
});

// Placeholder for Admin: Get user engagement metrics
export const getUserEngagementMetrics = asyncHandler(async (req: IAuthRequest, res: Response) => {
  // TODO: Calculate metrics like DAU, MAU, session duration, feature adoption from AnalyticsEvent data
  res.status(200).json({ message: 'User engagement metrics (to be implemented)' });
});

// Placeholder for Admin: Get content performance
export const getContentPerformance = asyncHandler(async (req: IAuthRequest, res: Response) => {
  // TODO: Analyze views, interactions, ratings related to content (recipes, articles)
  res.status(200).json({ message: 'Content performance analytics (to be implemented)' });
});

// Placeholder for Admin: Generate custom report
export const generateCustomReport = [
    // Example: Add validation for report parameters if any
    // body('reportType').notEmpty().withMessage('Report type is required'),
    // body('dateRange.start').isISO8601().toDate().withMessage('Invalid start date'),
    // body('dateRange.end').isISO8601().toDate().withMessage('Invalid end date'),

    asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        // const { reportType, dateRange, filters } = req.body;
        // TODO: Implement logic to generate custom report based on parameters
        res.status(200).json({ message: 'Custom report generation (to be implemented)', params: req.body });
    })
]; 