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