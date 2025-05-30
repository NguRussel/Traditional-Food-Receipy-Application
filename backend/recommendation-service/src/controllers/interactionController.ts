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

/**
 * @desc    Get personalized recipe recommendations for a user
 * @route   GET /api/v1/recommendations/for-you
 * @access  Private (requires user ID)
 */
export const getForYouRecommendations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Assume userId is available, e.g., from auth middleware or query param for now
  // For a real implementation, this ID would come from an authenticated session.
  const userId = req.query.userId as string; // Or req.user.id if auth is in place

  if (!userId) {
    res.status(400).json({ success: false, message: 'User ID is required to get personalized recommendations' });
    return;
  }

  // --- Basic Placeholder Logic --- 
  // 1. Find recent positive interactions by the user.
  // Positive interactions could be 'like', 'save', 'cook', or a high 'rating'.
  const positiveInteractionTypes = ['like', 'save', 'cook', 'rating']; // 'rating' implies a rating interaction occurred
  
  const recentInteractions = await UserInteractionModel.find({
    userId: userId, 
    $or: [
      { interactionType: { $in: positiveInteractionTypes.filter(type => type !== 'rating') } },
      { interactionType: 'rating', rating: { $gte: 4 } } // Consider ratings >= 4 as positive
    ]
  })
  .sort({ createdAt: -1 })
  .limit(20) // Get a decent number of recent interactions to work with
  .select('recipeId interactionType rating createdAt') // Select relevant fields
  .lean(); // Use .lean() for faster queries if not modifying docs

  if (!recentInteractions || recentInteractions.length === 0) {
    res.status(200).json({ 
      success: true, 
      message: 'No recent positive interactions found to generate recommendations. Explore more recipes!', 
      data: [] 
    });
    return;
  }

  // 2. Extract unique recipe IDs from these interactions.
  // Prioritize more recent or more impactful interactions if desired (e.g. 'cook' > 'like')
  // For now, just unique IDs
  const recommendedRecipeIds = [...new Set(recentInteractions.map(interaction => interaction.recipeId.toString()))];

  // 3. In a real system, you'd fetch full recipe details for these IDs from the RecipeService.
  // For this placeholder, we'll just return the IDs.
  // You might also want to filter out recipes the user has interacted with very recently (e.g., viewed today).

  // Simulate fetching recipe details (in a real app, this would be an API call or DB query to Recipe service)
  const recommendedRecipes = recommendedRecipeIds.map(id => ({
    recipeId: id,
    // Placeholder: In a real scenario, you would fetch actual recipe data here
    // title: "Fetched Recipe Title for " + id, 
    // description: "Fetched recipe description..."
  }));

  res.status(200).json({
    success: true,
    message: 'Personalized recommendations retrieved (placeholder logic)',
    count: recommendedRecipes.length,
    data: recommendedRecipes, // Returning IDs, or mocked details
  });
});

/**
 * @desc    Get recipes similar to a given recipe ID
 * @route   GET /api/v1/recommendations/similar/:recipeId
 * @access  Public
 */
export const getSimilarRecipes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const targetRecipeId = req.params.recipeId;

  // --- Highly Placeholder Logic --- 
  // 1. Find users who had strong positive interactions with the targetRecipeId.
  const positiveInteractionTypes = ['like', 'save', 'cook', 'rating'];
  const interactionsWithTarget = await UserInteractionModel.find({
    recipeId: targetRecipeId,
    $or: [
      { interactionType: { $in: positiveInteractionTypes.filter(type => type !== 'rating') } },
      { interactionType: 'rating', rating: { $gte: 4 } }
    ]
  })
  .limit(50) // Consider interactions from a sample of users
  .select('userId')
  .lean();

  if (!interactionsWithTarget || interactionsWithTarget.length === 0) {
    res.status(200).json({ 
      success: true, 
      message: 'No significant user interaction data found for the target recipe to find similar ones. Try a popular recipe!', 
      data: [] 
    });
    return;
  }

  const usersWhoInteractedPositively = [...new Set(interactionsWithTarget.map(i => i.userId.toString()))];

  // 2. Find other recipes these users also interacted positively with.
  if (usersWhoInteractedPositively.length === 0) {
    res.status(200).json({ 
        success: true, 
        message: 'No users found with positive interactions for the target recipe to base similarity on.', 
        data: [] 
      });
      return;
  }

  const similarRecipeInteractions = await UserInteractionModel.find({
    userId: { $in: usersWhoInteractedPositively }, // Users from step 1
    recipeId: { $ne: targetRecipeId }, // Exclude the original recipe
    $or: [
      { interactionType: { $in: positiveInteractionTypes.filter(type => type !== 'rating') } },
      { interactionType: 'rating', rating: { $gte: 4 } }
    ]
  })
  .sort({ createdAt: -1 }) // Prioritize more recent interactions
  .limit(100) // Get a pool of potential similar recipe interactions
  .select('recipeId')
  .lean();

  if (!similarRecipeInteractions || similarRecipeInteractions.length === 0) {
    res.status(200).json({ 
      success: true, 
      message: 'Could not find other recipes based on shared user interaction patterns.', 
      data: [] 
    });
    return;
  }

  // 3. Aggregate and rank these other recipes (e.g., by frequency of positive interaction)
  // For now, just unique recipe IDs, perhaps limited
  const similarRecipeIds = [...new Set(similarRecipeInteractions.map(interaction => interaction.recipeId.toString()))].slice(0, 10);

  const similarRecipes = similarRecipeIds.map(id => ({
    recipeId: id,
    // Placeholder: In a real scenario, you would fetch actual recipe data here
  }));

  res.status(200).json({
    success: true,
    message: 'Similar recipes retrieved (placeholder logic based on user interactions)',
    count: similarRecipes.length,
    data: similarRecipes,
  });
}); 