import { Request, Response, NextFunction } from 'express';
import UserInteractionModel, { IUserInteraction } from '../models/UserInteraction';
import { PipelineStage } from 'mongoose';
import { IAuthRequest } from '../middleware/authMiddleware';

// Utility for handling async route handlers and catching errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @desc    Track a new user interaction
 * @route   POST /api/v1/recommendations/interaction
 * @access  Private (User must be authenticated)
 */
export const trackInteraction = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const { recipeId, interactionType, duration, rating } = req.body;
  const userId = req.user?.id; // Get userId from authenticated user

  if (!userId) {
    // This case should ideally be caught by 'protect' middleware already
    res.status(400).json({ success: false, message: 'User ID not found in authenticated request.'});
    return;
  }
  // Validation for other fields is handled by express-validator in routes

  const interaction = await UserInteractionModel.create({
    userId,
    recipeId,
    interactionType,
    duration,
    rating,
  });
  res.status(201).json({ success: true, message: 'Interaction tracked successfully', data: interaction });
});

/**
 * @desc    Get personalized recipe recommendations for a user
 * @route   GET /api/v1/recommendations/for-you
 * @access  Private (User must be authenticated)
 */
export const getForYouRecommendations = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id; // Get userId from authenticated user
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID not found. Authentication required.' });
  }
  // ... (rest of the logic remains the same, validation for userId query param will be removed from route)
  // ... (find recentInteractions using this userId)
  const positiveInteractionTypes = ['like', 'save', 'cook', 'rating'];
  const recentInteractions = await UserInteractionModel.find({
    userId: userId, 
    $or: [
      { interactionType: { $in: positiveInteractionTypes.filter(type => type !== 'rating') } },
      { interactionType: 'rating', rating: { $gte: 4 } }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(20)
  .select('recipeId interactionType rating createdAt')
  .lean();

  if (!recentInteractions || recentInteractions.length === 0) {
    return res.status(200).json({ 
      success: true, 
      message: 'No recent positive interactions found to generate recommendations. Explore more recipes!', 
      data: [] 
    });
  }
  const recommendedRecipeIds = [...new Set(recentInteractions.map(interaction => interaction.recipeId.toString()))];
  const recommendedRecipes = recommendedRecipeIds.map(id => ({ recipeId: id }));
  res.status(200).json({
    success: true,
    message: 'Personalized recommendations retrieved',
    count: recommendedRecipes.length,
    data: recommendedRecipes,
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

/**
 * @desc    Get trending recipes based on recent positive interactions
 * @route   GET /api/v1/recommendations/trending
 * @access  Public
 */
export const getTrendingRecipes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Define what a "recent" period is (e.g., last 7 days)
  const recentDays = 7;
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - recentDays);

  // --- Placeholder Logic for Trending --- 
  // 1. Aggregate positive interactions recently.
  // We can assign weights to different interaction types if desired.
  // For simplicity, we'll count 'like', 'save', 'cook', and high 'rating' as 1 point each.

  const trendingPipeline: PipelineStage[] = [
    {
      $match: {
        createdAt: { $gte: sinceDate },
        $or: [
          { interactionType: { $in: ['like', 'save', 'cook'] } },
          { interactionType: 'rating', rating: { $gte: 4 } }
        ]
      }
    },
    {
      $group: {
        _id: '$recipeId',
        trendScore: { $sum: 1 } // Each positive interaction contributes 1 to the score
      }
    },
    {
      $sort: { trendScore: -1 } // Sort by the highest score
    },
    {
      $limit: 10 // Get top N trending recipes
    }
  ];

  const trendingRecipeIds = await UserInteractionModel.aggregate(trendingPipeline);

  if (!trendingRecipeIds || trendingRecipeIds.length === 0) {
    res.status(200).json({ 
      success: true, 
      message: 'No trending recipes found based on recent activity.', 
      data: [] 
    });
    return;
  }

  // 2. In a real system, fetch full recipe details for these IDs from RecipeService.
  const trendingRecipes = trendingRecipeIds.map(item => ({
    recipeId: item._id, // _id from the $group stage is the recipeId
    trendScore: item.trendScore,
    // Placeholder: Fetch actual recipe data here
  }));

  res.status(200).json({
    success: true,
    message: 'Trending recipes retrieved (placeholder logic)',
    count: trendingRecipes.length,
    data: trendingRecipes,
  });
});

/**
 * @desc    Get recipe suggestions based on a list of ingredients
 * @route   GET /api/v1/recommendations/based-on-ingredients
 * @access  Public
 */
export const getRecipesByIngredients = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ingredientsQuery = req.query.ingredients as string;

  if (!ingredientsQuery) {
    res.status(400).json({ success: false, message: 'Please provide a list of ingredients as a query parameter (e.g., ingredients=tomatoes,onions,garlic)' });
    return;
  }

  const providedIngredients = ingredientsQuery.split(',').map(ing => ing.trim().toLowerCase()).filter(ing => ing);

  if (providedIngredients.length === 0) {
    res.status(400).json({ success: false, message: 'No valid ingredients provided in the query.' });
    return;
  }

  // --- Highly Placeholder Logic --- 
  // In a real system, you would:
  // 1. Parse and normalize the provided ingredients.
  // 2. Query your Recipe database/service for recipes that contain these ingredients.
  //    - This might involve partial matches, matching all ingredients, or matching some.
  //    - Ranking would be based on how many ingredients match, popularity, etc.
  // 3. Return a list of matching recipe IDs (and then their details).

  // For this placeholder, we'll just acknowledge the ingredients and return a mock response.
  const mockRecipeSuggestions = [
    { recipeId: 'mockRecipeId1', name: 'Suggested Recipe 1 (Placeholder)', matchedIngredients: providedIngredients.slice(0,1) },
    { recipeId: 'mockRecipeId2', name: 'Suggested Recipe 2 (Placeholder)', matchedIngredients: providedIngredients.slice(0,2) },
  ];
  
  // Simulate finding some recipes if at least one ingredient was given
  const recipesToReturn = providedIngredients.length > 0 ? mockRecipeSuggestions : [];

  res.status(200).json({
    success: true,
    message: `Placeholder: Recipes based on ingredients: ${providedIngredients.join(', ')}. Full implementation requires recipe data access.`,
    providedIngredients: providedIngredients,
    count: recipesToReturn.length,
    data: recipesToReturn,
  });
});

/**
 * @desc    Get a user's taste profile based on their interactions
 * @route   GET /api/v1/recommendations/user-taste-profile
 * @access  Private (User must be authenticated)
 */
export const getUserTasteProfile = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id; // Get userId from authenticated user
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID not found. Authentication required.' });
  }
  // ... (rest of the logic, validation for userId query param will be removed from route)
  const userInteractions = await UserInteractionModel.find({ userId: userId })
    .sort({ createdAt: -1 })
    .limit(200)
    .select('recipeId interactionType rating')
    .lean();

  if (!userInteractions || userInteractions.length === 0) {
    return res.status(200).json({ 
      success: true, 
      message: 'No interaction history found for this user to build a taste profile. Start interacting with recipes!',
      data: { interactionSummary: {}, recentlyInteractedRecipeIds: [] }
    });
  }
  const interactionSummary: { [key: string]: number } = {};
  userInteractions.forEach(interaction => {
    interactionSummary[interaction.interactionType] = (interactionSummary[interaction.interactionType] || 0) + 1;
    if (interaction.interactionType === 'rating' && interaction.rating) {
      const ratingKey = `rated_${interaction.rating}_star`;
      interactionSummary[ratingKey] = (interactionSummary[ratingKey] || 0) + 1;
    }
  });
  const positiveRecipeIds = [
    ...new Set(
      userInteractions
        .filter(i => i.interactionType === 'like' || i.interactionType === 'save' || i.interactionType === 'cook' || (i.interactionType === 'rating' && i.rating && i.rating >= 4))
        .map(i => i.recipeId.toString()))
  ];
  res.status(200).json({
    success: true,
    message: 'User taste profile retrieved',
    data: {
      userId: userId,
      totalInteractions: userInteractions.length,
      interactionSummary: interactionSummary,
      distinctPositivelyInteractedRecipes: positiveRecipeIds.length,
      recentPositiveInteractionsRecipeIds: positiveRecipeIds.slice(0, 20),
    },
  });
});

/**
 * @desc    Get analytics for the recommendation service (Admin Only)
 * @route   GET /api/v1/recommendations/admin/analytics
 * @access  Admin
 */
export const getRecommendationAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // In a real system, this would:
  // 1. Be protected by admin authentication/authorization middleware.
  // 2. Aggregate data from UserInteractionModel (e.g., interaction counts, popular recipes, etc.)
  // 3. Potentially query data about recommendation model performance if applicable.

  // Placeholder response:
  res.status(200).json({
    success: true,
    message: 'Recommendation service analytics (placeholder - admin only)',
    data: {
      totalInteractionsTracked: await UserInteractionModel.countDocuments(),
      sampleMetric: 'Example: Click-through rate on recommendations: X%',
      notes: 'This endpoint would provide detailed analytics for administrators.'
    }
  });
});

/**
 * @desc    Trigger retraining of the recommendation model (Admin Only)
 * @route   POST /api/v1/recommendations/admin/retrain-model
 * @access  Admin
 */
export const triggerModelRetraining = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // In a real system, this would:
  // 1. Be protected by admin authentication/authorization middleware.
  // 2. Initiate a background job or process to retrain the ML models using the latest interaction data.
  // 3. This could involve calling external ML services or internal scripts.

  // Placeholder response:
  res.status(200).json({
    success: true,
    message: 'Recommendation model retraining process initiated (placeholder - admin only)',
    data: {
      status: 'RetrainingJobScheduled',
      timestamp: new Date(),
      notes: 'This endpoint would trigger a model retraining pipeline.'
    }
  });
}); 