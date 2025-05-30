import { Request, Response, NextFunction } from 'express';
import UserInteractionModel, { IUserInteraction } from '../models/UserInteraction';

// Utility for handling async route handlers and catching errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @desc    Track a new user interaction
 * @route   POST /api/v1/recommendations/interaction
 * @access  Public (or Private if userId is from auth token)
 */
export const trackInteraction = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const {
    userId,
    recipeId,
    interactionType,
    duration,
    rating
  } = req.body;

  // Manual validation removed, now handled by express-validator middleware

  const interaction = await UserInteractionModel.create({
    userId,
    recipeId,
    interactionType,
    duration,
    rating,
  });

  res.status(201).json({
    success: true,
    message: 'Interaction tracked successfully',
    data: interaction,
  });
}); 