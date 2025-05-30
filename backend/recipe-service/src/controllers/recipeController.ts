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