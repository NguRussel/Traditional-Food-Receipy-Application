import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ReviewModel, { IReview } from '../models/Review';
import { Types } from 'mongoose'; // Import Types for ObjectId validation/casting
import CustomError from '../utils/CustomError';
// import { IAuthRequest } from '../middleware/authMiddleware'; // Will be needed later for auth

// @desc    Create a new review
// @route   POST /api/v1/reviews
// @access  Private (User must be authenticated)
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { recipeId, userId, rating, comment } = req.body;

  // Basic validation (more robust validation will be done by middleware later)
  if (!recipeId || !userId || !rating) {
    throw new CustomError('Missing required fields: recipeId, userId, and rating are required.', 400);
  }
  if (!Types.ObjectId.isValid(recipeId)) {
    throw new CustomError('Invalid recipeId format.', 400);
  }
  if (!Types.ObjectId.isValid(userId)) {
    throw new CustomError('Invalid userId format.', 400);
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw new CustomError('Rating must be a number between 1 and 5.', 400);
  }

  // For now, userId comes from req.body. Later, it will be from (req as IAuthRequest).user.id;
  const reviewData: Partial<IReview> = {
    recipeId: new Types.ObjectId(recipeId),
    userId: new Types.ObjectId(userId),
    rating,
  };
  if (comment) {
    reviewData.comment = comment;
  }

  const newReview = await ReviewModel.create(reviewData);

  res.status(201).json({ 
    success: true, 
    message: 'Review created successfully', 
    data: newReview 
  });
});

// @desc    Get all reviews for a specific recipe
// @route   GET /api/v1/reviews/recipe/:recipeId
// @access  Public
export const getReviewsForRecipe = asyncHandler(async (req: Request, res: Response) => {
  const { recipeId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  if (!Types.ObjectId.isValid(recipeId)) {
    throw new CustomError('Invalid recipeId format.', 400);
  }

  const query = { recipeId: new Types.ObjectId(recipeId) };

  const reviews = await ReviewModel.find(query)
    .sort({ createdAt: -1 }) // Sort by newest first
    .skip(skip)
    .limit(limit);
  
  const totalReviews = await ReviewModel.countDocuments(query);
  const totalPages = Math.ceil(totalReviews / limit);

  if (!reviews.length && page > 1) {
    // If no reviews found for a page > 1, it means the page number is too high
    throw new CustomError('No reviews found for this page.', 404);
  }
  // It's okay to return an empty array if no reviews for recipeId on page 1

  res.status(200).json({
    success: true,
    message: 'Reviews retrieved successfully',
    count: reviews.length,
    totalReviews,
    totalPages,
    currentPage: page,
    data: reviews,
  });
});

// @desc    Get a single review by its ID
// @route   GET /api/v1/reviews/:id
// @access  Public
export const getReviewById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw new CustomError('Invalid review ID format.', 400);
  }

  const review = await ReviewModel.findById(id);

  if (!review) {
    throw new CustomError('Review not found.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Review retrieved successfully',
    data: review,
  });
});

// @desc    Update a review
// @route   PUT /api/v1/reviews/:id
// @access  Private (User must own the review)
export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  // const { id } = req.params;
  // const { rating, comment } = req.body;
  // const userId = (req as IAuthRequest).user.id;
  // Logic to update a review, ensuring user owns it
  res.status(200).json({ message: `PUT /api/v1/reviews/${req.params.id} - Placeholder for updateReview` });
});

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private (User must own the review or be an Admin)
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  // const { id } = req.params;
  // const userId = (req as IAuthRequest).user.id;
  // const userRoles = (req as IAuthRequest).user.roles;
  // Logic to delete a review, ensuring user owns it or is an admin
  res.status(200).json({ message: `DELETE /api/v1/reviews/${req.params.id} - Placeholder for deleteReview` });
});

// @desc    Get all reviews by a specific user
// @route   GET /api/v1/reviews/user/:userId
// @access  Public (or Private if only for authenticated user to see their own)
export const getReviewsByUser = asyncHandler(async (req: Request, res: Response) => {
  // const { userId } = req.params;
  // const { page = 1, limit = 10 } = req.query; 
  // Logic to fetch reviews by a user with pagination
  res.status(200).json({ message: `GET /api/v1/reviews/user/${req.params.userId} - Placeholder for getReviewsByUser` });
}); 