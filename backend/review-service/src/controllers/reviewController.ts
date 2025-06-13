import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ReviewModel, { IReview } from '../models/Review';
import { Types } from 'mongoose'; // Import Types for ObjectId validation/casting
import CustomError from '../utils/CustomError';
import { IAuthRequest } from '../middleware/authMiddleware'; // Import IAuthRequest

// @desc    Create a new review
// @route   POST /api/v1/reviews
// @access  Private (User must be authenticated)
export const createReview = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { recipeId, rating, comment } = req.body;
  const userId = req.user!.id;

  // Validation is now handled by validationMiddleware

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
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;

  // Ensure page and limit are integers and within valid ranges after potential toInt() from middleware
  // The validation middleware should handle invalid formats, but this provides a fallback.
  page = Math.max(1, Math.floor(page));
  limit = Math.min(100, Math.max(1, Math.floor(limit)));

  const skip = (page - 1) * limit;

  const query = { recipeId: new Types.ObjectId(recipeId) };

  const reviews = await ReviewModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const totalReviews = await ReviewModel.countDocuments(query);
  const totalPages = Math.ceil(totalReviews / limit);

  if (!reviews.length && page > 1) {
    throw new CustomError('No reviews found for this page.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Reviews retrieved successfully',
    count: reviews.length,
    totalReviews,
    totalPages,
    currentPage: Number(page), // Ensure it's a number in the response
    data: reviews,
  });
});

// @desc    Get a single review by its ID
// @route   GET /api/v1/reviews/:id
// @access  Public
export const getReviewById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Validation for id format is handled by middleware

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
export const updateReview = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const requestingUserId = req.user!.id;

  // Validation for id, rating, comment, and ensuring at least one field is present, handled by middleware

  const review = await ReviewModel.findById(id);

  if (!review) {
    throw new CustomError('Review not found.', 404);
  }

  if (review.userId.toString() !== requestingUserId) {
    throw new CustomError('Not authorized to update this review.', 403);
  }

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;

  const updatedReview = await review.save();

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: updatedReview,
  });
});

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private (User must own the review or be an Admin)
export const deleteReview = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;
  const requestingUserId = req.user!.id;
  const requestingUserRoles = req.user!.roles;

  // Validation for id format handled by middleware

  const review = await ReviewModel.findById(id);

  if (!review) {
    throw new CustomError('Review not found.', 404);
  }

  const isAdmin = requestingUserRoles.includes('admin');
  const isOwner = review.userId.toString() === requestingUserId;

  if (!isAdmin && !isOwner) {
    throw new CustomError('Not authorized to delete this review.', 403);
  }

  await ReviewModel.findByIdAndDelete(id);

  res.status(200).json({ 
    success: true, 
    message: 'Review deleted successfully',
    data: {} 
  });
});

// @desc    Get all reviews by a specific user
// @route   GET /api/v1/reviews/user/:userId
// @access  Public
export const getReviewsByUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;

  page = Math.max(1, Math.floor(page));
  limit = Math.min(100, Math.max(1, Math.floor(limit)));

  const skip = (page - 1) * limit;

  const query = { userId: new Types.ObjectId(userId) };

  const reviews = await ReviewModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const totalReviews = await ReviewModel.countDocuments(query);
  const totalPages = Math.ceil(totalReviews / limit);

  if (!reviews.length && page > 1) {
    throw new CustomError('No reviews found for this page for the specified user.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Reviews by user retrieved successfully',
    count: reviews.length,
    totalReviews,
    totalPages,
    currentPage: Number(page), // Ensure it's a number in the response
    data: reviews,
  });
}); 