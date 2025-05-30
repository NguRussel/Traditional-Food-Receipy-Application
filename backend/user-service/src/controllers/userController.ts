import { Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import asyncHandler from '../utils/asyncHandler';
import { IAuthRequest } from '../middleware/authMiddleware'; // Assuming clerkId is on req.user.id
import mongoose from 'mongoose';

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, no token'); // Or use AuthError
  }
  const user = await User.findOne({ clerkId: req.user.id }).select('-mealPlans._id -mealPlans.meals._id'); // Exclude sub-document _ids if not needed

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile (fullName, username, avatar)
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }
  const user = await User.findOne({ clerkId: req.user.id });

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.username = req.body.username || user.username;
    user.avatar = req.body.avatar || user.avatar;

    // Check if username is being changed and if it's already taken by another user
    if (req.body.username && req.body.username !== user.username) {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser && existingUser.clerkId !== user.clerkId) {
        res.status(400);
        throw new Error('Username already taken');
      }
    }

    const updatedUser = await user.save();
    res.json({
      clerkId: updatedUser.clerkId,
      fullName: updatedUser.fullName,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      preferences: updatedUser.preferences,
      // Add other fields you want to return
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user preferences
// @route   PUT /api/v1/users/preferences
// @access  Private
export const updateUserPreferences = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }
  const user = await User.findOne({ clerkId: req.user.id });

  if (user) {
    const { dietaryRestrictions, allergies, favoriteRegions, favoriteTribes, spiceLevel, cookingExperience } = req.body;
    
    user.preferences = {
      dietaryRestrictions: dietaryRestrictions || user.preferences.dietaryRestrictions,
      allergies: allergies || user.preferences.allergies,
      favoriteRegions: favoriteRegions || user.preferences.favoriteRegions,
      favoriteTribes: favoriteTribes || user.preferences.favoriteTribes,
      spiceLevel: spiceLevel || user.preferences.spiceLevel,
      cookingExperience: cookingExperience || user.preferences.cookingExperience,
    };

    const updatedUser = await user.save();
    res.json(updatedUser.preferences);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// FAVORITES MANAGEMENT

// @desc    Get user's favorite recipes
// @route   GET /api/v1/users/favorites
// @access  Private
export const getFavoriteRecipes = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401); throw new Error('Not authorized');
  }
  const user = await User.findOne({ clerkId: req.user.id }).populate('favorites'); // Assuming 'favorites' stores ObjectId and refers to a 'Recipe' model (potentially in another service)
  
  if (user) {
    res.json(user.favorites);
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// @desc    Add a recipe to user's favorites
// @route   POST /api/v1/users/favorites/:recipeId
// @access  Private
export const addRecipeToFavorites = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401); throw new Error('Not authorized');
  }
  const { recipeId } = req.params;
  // Basic validation for recipeId - ideally use mongoose.Types.ObjectId.isValid
  if (!recipeId || typeof recipeId !== 'string') { // Add more robust validation later
      res.status(400); throw new Error('Invalid Recipe ID format');
  }

  const user = await User.findOne({ clerkId: req.user.id });

  if (user) {
    // Check if already favorited
    if (user.favorites.includes(recipeId as any)) { // Cast to any if recipeId is string and favorites is ObjectId[]
      res.status(400); throw new Error('Recipe already in favorites');
    }
    user.favorites.push(recipeId as any);
    await user.save();
    res.status(201).json({ message: 'Recipe added to favorites', favorites: user.favorites });
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// @desc    Remove a recipe from user's favorites
// @route   DELETE /api/v1/users/favorites/:recipeId
// @access  Private
export const removeRecipeFromFavorites = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401); throw new Error('Not authorized');
  }
  const { recipeId } = req.params;
  // Validation for recipeId is handled by validateMongoIdParam middleware

  const user = await User.findOne({ clerkId: req.user.id });

  if (user) {
    const initialLength = user.favorites.length;
    user.favorites = user.favorites.filter(favId => favId.toString() !== recipeId);
    
    if (user.favorites.length === initialLength) {
      res.status(404); throw new Error('Recipe not found in favorites');
    }

    await user.save();
    res.json({ message: 'Recipe removed from favorites', favorites: user.favorites });
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// MEAL PLANNING MANAGEMENT

// @desc    Get user's meal plans
// @route   GET /api/v1/users/meal-plans
// @access  Private
export const getMealPlans = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) { res.status(401); throw new Error('Not authorized'); }
  
  const user = await User.findOne({ clerkId: req.user.id }).select('mealPlans').populate('mealPlans.meals.breakfast mealPlans.meals.lunch mealPlans.meals.dinner mealPlans.meals.snacks');
  // Populate recipe details. Adjust path if Recipe model is in a different DB/service or not directly referenced.

  if (user) {
    res.json(user.mealPlans);
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// @desc    Create a new meal plan
// @route   POST /api/v1/users/meal-plans
// @access  Private
export const createMealPlan = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) { res.status(401); throw new Error('Not authorized'); }

  const { name, startDate, endDate, meals } = req.body;
  // Validation for these fields will be handled by middleware

  const user = await User.findOne({ clerkId: req.user.id });

  if (user) {
    const newMealPlan = {
      name,
      startDate,
      endDate,
      meals: meals || [], // Ensure meals is an array
    };
    user.mealPlans.push(newMealPlan as any); // Cast to any to satisfy subdocument type if needed, ensure structure matches IMealPlan
    await user.save();
    // Return only the newly created meal plan. The last one in the array.
    res.status(201).json(user.mealPlans[user.mealPlans.length - 1]);
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// @desc    Update a meal plan
// @route   PUT /api/v1/users/meal-plans/:mealPlanId
// @access  Private
export const updateMealPlan = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) { res.status(401); throw new Error('Not authorized'); }

  const { mealPlanId } = req.params;
  const { name, startDate, endDate, meals } = req.body;

  const user = await User.findOne({ clerkId: req.user.id });

  if (user) {
    const mealPlan = user.mealPlans.find(mp => mp._id.toString() === mealPlanId);
    if (!mealPlan) {
      res.status(404); throw new Error('Meal plan not found');
    }

    if (name) mealPlan.name = name;
    if (startDate) mealPlan.startDate = startDate;
    if (endDate) mealPlan.endDate = endDate;
    if (meals) mealPlan.meals = meals; 

    await user.save();
    res.json(mealPlan);
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// @desc    Delete a meal plan
// @route   DELETE /api/v1/users/meal-plans/:mealPlanId
// @access  Private
export const deleteMealPlan = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) { res.status(401); throw new Error('Not authorized'); }

  const { mealPlanId } = req.params;
  const user = await User.findOne({ clerkId: req.user.id });

  if (user) {
    const mealPlanIndex = user.mealPlans.findIndex(mp => mp._id.toString() === mealPlanId);
    
    if (mealPlanIndex === -1) {
        res.status(404); throw new Error('Meal plan not found');
    }
    
    user.mealPlans.splice(mealPlanIndex, 1);

    await user.save();
    res.json({ message: 'Meal plan removed successfully' });
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// USER ACTIVITY MANAGEMENT

// @desc    Add a search term to user's search history
// @route   POST /api/v1/users/search-history
// @access  Private
export const addSearchTerm = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) { res.status(401); throw new Error('Not authorized'); }

  const { searchTerm } = req.body;
  if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
    res.status(400); throw new Error('Search term is required and must be a non-empty string');
  }

  const user = await User.findOne({ clerkId: req.user.id });

  if (user) {
    // Add to the beginning and keep unique, limit history size (e.g., to 50)
    user.searchHistory = [searchTerm, ...user.searchHistory.filter(term => term !== searchTerm)].slice(0, 50);
    await user.save();
    res.status(201).json({ message: 'Search term added to history', searchHistory: user.searchHistory });
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// @desc    Get user's view history
// @route   GET /api/v1/users/view-history
// @access  Private
export const getViewHistory = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) { res.status(401); throw new Error('Not authorized'); }

  const user = await User.findOne({ clerkId: req.user.id }).select('viewHistory').populate('viewHistory');
  // Populate recipe details if viewHistory stores ObjectIds and refers to a Recipe model.

  if (user) {
    res.json(user.viewHistory);
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// @desc    Add a recipe to user's view history
// @route   POST /api/v1/users/view-history/:recipeId
// @access  Private
export const addRecipeToViewHistory = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) { res.status(401); throw new Error('Not authorized'); }

  const { recipeId } = req.params; // Validation by validateMongoIdParam middleware

  const user = await User.findOne({ clerkId: req.user.id });

  if (user) {
    const recipeObjectId = new mongoose.Types.ObjectId(recipeId);
    user.viewHistory = [recipeObjectId, ...user.viewHistory.filter(id => !id.equals(recipeObjectId))].slice(0, 100);
    
    await user.save();
    res.status(201).json({ message: 'Recipe added to view history', viewHistory: user.viewHistory });
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// ADMIN USER MANAGEMENT

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users/admin/all
// @access  Private (Admin)
export const getAllUsers = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  // Authorization check for 'admin' role will be handled by middleware
  const users = await User.find({}).select('-favorites -mealPlans -searchHistory -viewHistory'); // Exclude sensitive or large arrays by default
  res.json(users);
});

// @desc    Update user status by Admin (e.g., active, suspended, banned)
// @route   PUT /api/v1/users/admin/:userId/status
// @access  Private (Admin)
export const updateUserStatusByAdmin = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const { userId } = req.params; // This is the User's MongoDB _id, not clerkId for this admin action
  const { accountStatus, suspensionReason, suspensionExpiry } = req.body;

  const userToUpdate = await User.findById(userId);

  if (!userToUpdate) {
    res.status(404); throw new Error('User not found');
  }

  userToUpdate.accountStatus = accountStatus || userToUpdate.accountStatus;
  if (accountStatus === 'suspended' || accountStatus === 'banned') {
    userToUpdate.suspensionReason = suspensionReason;
    userToUpdate.suspensionExpiry = accountStatus === 'suspended' ? suspensionExpiry : undefined;
  } else {
    userToUpdate.suspensionReason = undefined;
    userToUpdate.suspensionExpiry = undefined;
  }
  // Potentially toggle isActive based on accountStatus
  userToUpdate.isActive = accountStatus === 'active';

  const updatedUser = await userToUpdate.save();
  res.json(updatedUser);
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/v1/users/admin/statistics
// @access  Private (Admin)
export const getUserStatistics = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const usersByStatus = await User.aggregate([
    { $group: { _id: "$accountStatus", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  const newUsersLast30Days = await User.countDocuments({
    createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
  });

  // More complex stats can be added, e.g., distribution by cooking experience, region, etc.

  res.json({
    totalUsers,
    activeUsers,
    pendingVerification: usersByStatus.find(s => s._id === 'pending_verification')?.count || 0,
    suspendedUsers: usersByStatus.find(s => s._id === 'suspended')?.count || 0,
    bannedUsers: usersByStatus.find(s => s._id === 'banned')?.count || 0,
    newUsersLast30Days,
    // usersByStatus, // Optionally return the raw aggregation
  });
}); 