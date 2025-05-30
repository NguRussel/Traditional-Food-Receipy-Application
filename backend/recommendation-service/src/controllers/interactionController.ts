import { Request, Response, NextFunction } from 'express';
import UserInteractionModel, { IUserInteraction } from '../models/UserInteraction';
import { PipelineStage } from 'mongoose';

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
 * @access  Private (requires user ID)
 */
export const getUserTasteProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.query.userId as string; // Or req.user.id if auth is in place

  if (!userId) {
    res.status(400).json({ success: false, message: 'User ID is required to get a taste profile.' });
    return;
  }

  // --- Basic Placeholder Logic for Taste Profile ---
  // 1. Fetch all (or a significant number of) interactions for the user.
  const userInteractions = await UserInteractionModel.find({ userId: userId })
    .sort({ createdAt: -1 })
    .limit(200) // Limit to a reasonable number for this placeholder
    .select('recipeId interactionType rating')
    .lean();

  if (!userInteractions || userInteractions.length === 0) {
    res.status(200).json({ 
      success: true, 
      message: 'No interaction history found for this user to build a taste profile. Start interacting with recipes!',
      data: { interactionSummary: {}, recentlyInteractedRecipeIds: [] }
    });
    return;
  }

  // 2. Summarize interactions
  const interactionSummary: { [key: string]: number } = {};
  userInteractions.forEach(interaction => {
    interactionSummary[interaction.interactionType] = (interactionSummary[interaction.interactionType] || 0) + 1;
    if (interaction.interactionType === 'rating' && interaction.rating) {
      const ratingKey = `rated_${interaction.rating}_star`;
      interactionSummary[ratingKey] = (interactionSummary[ratingKey] || 0) + 1;
    }
  });

  // 3. Get a list of unique recipe IDs the user has positively interacted with
  const positiveRecipeIds = [
    ...new Set(
      userInteractions
        .filter(i => 
          i.interactionType === 'like' || 
          i.interactionType === 'save' || 
          i.interactionType === 'cook' || 
          (i.interactionType === 'rating' && i.rating && i.rating >= 4)
        )
        .map(i => i.recipeId.toString())
    )
  ];

  // In a real system, you'd analyze these interactions further:
  // - Aggregate common tags/categories/ingredients from the interacted recipes (needs recipe data).
  // - Identify preferred cooking times, difficulties etc.

  res.status(200).json({
    success: true,
    message: 'User taste profile retrieved (placeholder logic based on interaction counts)',
    data: {
      userId: userId,
      totalInteractions: userInteractions.length,
      interactionSummary: interactionSummary,
      distinctPositivelyInteractedRecipes: positiveRecipeIds.length,
      recentPositiveInteractionsRecipeIds: positiveRecipeIds.slice(0, 20), // Show some examples
      // Note: Further analysis would require fetching details for these recipe IDs from RecipeService
      // to identify common attributes (tags, ingredients, cuisine types etc.)
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