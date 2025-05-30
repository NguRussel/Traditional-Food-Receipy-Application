import { Request, Response, NextFunction } from 'express';
import RecipeModel, { IRecipe } from '../models/Recipe';
import mongoose from 'mongoose';

// Utility to handle controller errors and pass them to the next middleware
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Create a new recipe
// @route   POST /api/v1/recipes
// @access  Private (Chef only - to be implemented)
export const createRecipe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // TODO: Add validation for req.body
  // TODO: Get chefId and chefName from authenticated user (e.g., req.user)
  const recipeData = { ...req.body };
  if (!recipeData.chefId || !recipeData.chefName) {
    res.status(400).json({ success: false, message: 'Chef ID and Chef Name are required' });
    return; // Ensure no further execution
  }

  try {
    const recipe: IRecipe = new RecipeModel(recipeData);
    await recipe.save();
    res.status(201).json({ success: true, data: recipe });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
        return;
    }
    // For other errors, let asyncHandler pass it to the global error handler
    throw error; 
  }
});

// @desc    Get all recipes
// @route   GET /api/v1/recipes
// @access  Public
export const getAllRecipes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement filtering, pagination, sorting
  const recipes = await RecipeModel.find().populate('chefId', 'name avatar');
  res.status(200).json({ success: true, count: recipes.length, data: recipes });
});

// @desc    Get single recipe by ID
// @route   GET /api/v1/recipes/:id
// @access  Public
export const getRecipeById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid Recipe ID' });
    return;
  }
  const recipe = await RecipeModel.findById(req.params.id).populate('chefId', 'name avatar');
  if (!recipe) {
    res.status(404).json({ success: false, message: 'Recipe not found' });
    return;
  }
  res.status(200).json({ success: true, data: recipe });
});

// @desc    Update a recipe
// @route   PUT /api/v1/recipes/:id
// @access  Private (Chef/Admin only - to be implemented)
export const updateRecipe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid Recipe ID' });
    return;
  }
  // TODO: Add validation for req.body
  // TODO: Add authorization to ensure only the recipe owner or an admin can update

  try {
    const recipe = await RecipeModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!recipe) {
      res.status(404).json({ success: false, message: 'Recipe not found' });
      return;
    }
    res.status(200).json({ success: true, data: recipe });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
        return;
    }
    throw error;
  }
});

// @desc    Delete a recipe
// @route   DELETE /api/v1/recipes/:id
// @access  Private (Chef/Admin only - to be implemented)
export const deleteRecipe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid Recipe ID' });
    return;
  }
  // TODO: Add authorization to ensure only the recipe owner or an admin can delete

  const recipe = await RecipeModel.findById(req.params.id);

  if (!recipe) {
    res.status(404).json({ success: false, message: 'Recipe not found' });
    return;
  }

  await recipe.deleteOne();
  res.status(200).json({ success: true, message: 'Recipe deleted successfully', data: {} });
});

// @desc    Search and filter recipes
// @route   GET /api/v1/recipes/search
// @access  Public
export const searchRecipes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { 
    q, 
    region, 
    category, 
    tribe,
    difficulty,
    minCookingTime, // in minutes
    maxCookingTime, // in minutes
    servings,
    ingredients, // comma-separated string of ingredients to match in tags
    page = 1, 
    limit = 10 // Default to 10 results per page
  } = req.query;

  const query: any = {};
  const cookingTimeQuery: any = {};

  if (q && typeof q === 'string') {
    query.$text = { $search: q };
  }
  if (region && typeof region === 'string') {
    query['tags.region'] = region;
  }
  if (category && typeof category === 'string') {
    query['tags.categories'] = category; // Assumes categories is an array in tags
  }
  if (tribe && typeof tribe === 'string') {
    query['tags.tribe'] = tribe;
  }
  if (difficulty && typeof difficulty === 'string') {
    query.difficulty = difficulty;
  }
  if (minCookingTime && !isNaN(Number(minCookingTime))) {
    cookingTimeQuery.$gte = Number(minCookingTime);
  }
  if (maxCookingTime && !isNaN(Number(maxCookingTime))) {
    cookingTimeQuery.$lte = Number(maxCookingTime);
  }
  if (Object.keys(cookingTimeQuery).length > 0) {
    query.cookingTime = cookingTimeQuery;
  }
  if (servings && !isNaN(Number(servings))) {
    query.servings = Number(servings);
  }
  if (ingredients && typeof ingredients === 'string') {
    const ingredientsArray = ingredients.split(',').map(ing => ing.trim()).filter(ing => ing);
    if (ingredientsArray.length > 0) {
        query['tags.ingredients'] = { $all: ingredientsArray }; // Match all provided ingredients
    }
  }
  
  query.status = 'approved'; // Only search for approved recipes by default
  query.isActive = true;    // Only search for active recipes

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const recipes = await RecipeModel.find(query)
                            .populate('chefId', 'name avatar')
                            .sort({ createdAt: -1 }) // Default sort by newest, can be made dynamic
                            .skip(skip)
                            .limit(limitNumber);
  
  const totalRecipes = await RecipeModel.countDocuments(query);

  res.status(200).json({
    success: true,
    count: recipes.length,
    totalPages: Math.ceil(totalRecipes / limitNumber),
    currentPage: pageNumber,
    data: recipes,
  });
});

// @desc    Get recipes by Chef ID
// @route   GET /api/v1/recipes/chef/:chefId
// @access  Public
export const getRecipesByChef = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { chefId } = req.params;
  const { page = 1, limit = 10 } = req.query; // Optional pagination

  if (!mongoose.Types.ObjectId.isValid(chefId)) {
    res.status(400).json({ success: false, message: 'Invalid Chef ID' });
    return;
  }

  const query: any = { 
    chefId: new mongoose.Types.ObjectId(chefId),
    status: 'approved', // Only show approved recipes
    isActive: true 
  };

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const recipes = await RecipeModel.find(query)
                            .populate('chefId', 'name avatar') // Should still populate to get chef details if needed on the recipe card
                            .sort({ createdAt: -1 })
                            .skip(skip)
                            .limit(limitNumber);
  
  const totalRecipes = await RecipeModel.countDocuments(query);
  
  if (!recipes || recipes.length === 0) {
    // It's better to return an empty array than a 404 if the chef is valid but has no recipes
    res.status(200).json({ success: true, count: 0, totalPages: 0, currentPage: pageNumber, data: [] });
    return;
  }

  res.status(200).json({
    success: true,
    count: recipes.length,
    totalPages: Math.ceil(totalRecipes / limitNumber),
    currentPage: pageNumber,
    data: recipes,
  });
});

// @desc    Get popular recipes (sorted by average rating)
// @route   GET /api/v1/recipes/popular
// @access  Public
export const getPopularRecipes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const query: any = { status: 'approved', isActive: true };

  const recipes = await RecipeModel.find(query)
                            .populate('chefId', 'name avatar')
                            .sort({ 'ratings.average': -1, 'ratings.count': -1 }) // Prioritize higher average, then more ratings
                            .skip(skip)
                            .limit(limitNumber);
  
  const totalRecipes = await RecipeModel.countDocuments(query);

  res.status(200).json({
    success: true,
    count: recipes.length,
    totalPages: Math.ceil(totalRecipes / limitNumber),
    currentPage: pageNumber,
    data: recipes,
  });
});

// @desc    Get recent recipes (sorted by creation date)
// @route   GET /api/v1/recipes/recent
// @access  Public
export const getRecentRecipes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const query: any = { status: 'approved', isActive: true };

  const recipes = await RecipeModel.find(query)
                            .populate('chefId', 'name avatar')
                            .sort({ createdAt: -1 })
                            .skip(skip)
                            .limit(limitNumber);

  const totalRecipes = await RecipeModel.countDocuments(query);

  res.status(200).json({
    success: true,
    count: recipes.length,
    totalPages: Math.ceil(totalRecipes / limitNumber),
    currentPage: pageNumber,
    data: recipes,
  });
});

// @desc    Get recipes by category
// @route   GET /api/v1/recipes/category/:category
// @access  Public
export const getRecipesByCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const query: any = { 
    'tags.categories': category, // Assumes 'categories' is an array in tags
    status: 'approved', 
    isActive: true 
  };

  const recipes = await RecipeModel.find(query)
                            .populate('chefId', 'name avatar')
                            .sort({ createdAt: -1 })
                            .skip(skip)
                            .limit(limitNumber);
  const totalRecipes = await RecipeModel.countDocuments(query);

  res.status(200).json({
    success: true,
    count: recipes.length,
    totalPages: Math.ceil(totalRecipes / limitNumber),
    currentPage: pageNumber,
    data: recipes,
  });
});

// @desc    Get recipes by region
// @route   GET /api/v1/recipes/region/:region
// @access  Public
export const getRecipesByRegion = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { region } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const query: any = { 
    'tags.region': region, 
    status: 'approved', 
    isActive: true 
  };

  const recipes = await RecipeModel.find(query)
                            .populate('chefId', 'name avatar')
                            .sort({ createdAt: -1 })
                            .skip(skip)
                            .limit(limitNumber);
  const totalRecipes = await RecipeModel.countDocuments(query);

  res.status(200).json({
    success: true,
    count: recipes.length,
    totalPages: Math.ceil(totalRecipes / limitNumber),
    currentPage: pageNumber,
    data: recipes,
  });
});

// @desc    Get recipes by tribe
// @route   GET /api/v1/recipes/tribe/:tribe
// @access  Public
export const getRecipesByTribe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tribe } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const query: any = { 
    'tags.tribe': tribe, 
    status: 'approved', 
    isActive: true 
  };

  const recipes = await RecipeModel.find(query)
                            .populate('chefId', 'name avatar')
                            .sort({ createdAt: -1 })
                            .skip(skip)
                            .limit(limitNumber);
  const totalRecipes = await RecipeModel.countDocuments(query);

  res.status(200).json({
    success: true,
    count: recipes.length,
    totalPages: Math.ceil(totalRecipes / limitNumber),
    currentPage: pageNumber,
    data: recipes,
  });
});

// @desc    Track a view for a recipe
// @route   POST /api/v1/recipes/:id/view
// @access  Public (or Private if only logged-in users can trigger views)
export const trackRecipeView = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid Recipe ID' });
    return;
  }

  const recipe = await RecipeModel.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } }, // Increment the views field by 1
    { new: true, runValidators: false } // Return the updated document, skip validators for this simple increment
  );

  if (!recipe) {
    res.status(404).json({ success: false, message: 'Recipe not found' });
    return;
  }

  // We might also want to record this interaction in the UserInteraction collection for the Recommendation Service
  // This would be an async call, potentially to another service or a direct DB write if sharing DB (not ideal for microservices)
  // Example: await recordUserInteraction(req.user?.id, id, 'view');

  res.status(200).json({ 
    success: true, 
    message: 'Recipe view tracked successfully', 
    data: { views: recipe.views } // Optionally return the new view count
  });
});

// @desc    Get related recipes
// @route   GET /api/v1/recipes/:id/related
// @access  Public
export const getRelatedRecipes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { limit = 5 } = req.query; // Default to 5 related recipes

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid Recipe ID' });
    return;
  }

  const originalRecipe = await RecipeModel.findById(id);

  if (!originalRecipe) {
    res.status(404).json({ success: false, message: 'Original recipe not found' });
    return;
  }

  const limitNumber = Number(limit);

  // Build the query for related recipes
  const relatedQuery: any = {
    _id: { $ne: originalRecipe._id }, // Exclude the original recipe itself
    status: 'approved',
    isActive: true,
    $or: [
      { 'tags.categories': { $in: originalRecipe.tags.categories } },
      { 'tags.region': originalRecipe.tags.region },
      // We could also add recipes from the same chef, if desired:
      // { chefId: originalRecipe.chefId }
    ],
  };

  // If the original recipe has a tribe, also consider recipes from the same tribe
  if (originalRecipe.tags.tribe) {
    relatedQuery.$or.push({ 'tags.tribe': originalRecipe.tags.tribe });
  }

  const relatedRecipes = await RecipeModel.find(relatedQuery)
    .populate('chefId', 'name avatar')
    .sort({ 'ratings.average': -1, createdAt: -1 }) // Sort by popularity, then recency
    .limit(limitNumber);

  res.status(200).json({
    success: true,
    count: relatedRecipes.length,
    data: relatedRecipes,
  });
}); 