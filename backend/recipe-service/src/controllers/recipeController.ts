import { Request, Response } from 'express';
import Recipe, { IRecipe } from '../models/Recipe';

// Create a new recipe
export const createRecipe = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      preparationTime,
      cookingTime,
      servings,
      difficulty,
      imageUrl,
      videoId,
      region,
      category,
      tags,
      cost
    } = req.body;

    // Validate required fields
    if (!title || !description || !ingredients || !instructions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create a new recipe
    const recipe = new Recipe({
      title,
      description,
      ingredients,
      instructions,
      preparationTime,
      cookingTime,
      servings,
      difficulty,
      imageUrl,
      videoId,
      createdBy: req.user?.id,
      region,
      category: Array.isArray(category) ? category : [category].filter(Boolean),
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      cost,
      isPublished: true,
      isFlagged: false
    });

    // Save to database
    await recipe.save();

    return res.status(201).json({
      message: 'Recipe created successfully',
      recipe
    });
  } catch (error) {
    console.error('Error in createRecipe controller:', error);
    return res.status(500).json({ message: 'Server error during recipe creation' });
  }
};

// Get all recipes with optional filtering
export const getRecipes = async (req: Request, res: Response) => {
  try {
    const { 
      region, 
      category, 
      difficulty, 
      cost, 
      ingredient, 
      search,
      page = 1,
      limit = 10
    } = req.query;
    
    // Build filter object
    const filter: any = { isPublished: true };
    
    if (region) filter.region = region;
    if (category) filter.category = { $in: Array.isArray(category) ? category : [category] };
    if (difficulty) filter.difficulty = difficulty;
    if (cost) filter.cost = cost;
    
    // Filter by ingredient if provided
    if (ingredient) {
      filter['ingredients.name'] = { $regex: new RegExp(String(ingredient), 'i') };
    }
    
    // Text search if provided
    let query = Recipe.find(filter);
    if (search) {
      query = Recipe.find(
        { $text: { $search: String(search) }, ...filter },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } });
    } else {
      query = query.sort({ createdAt: -1 });
    }
    
    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const recipes = await query.skip(skip).limit(Number(limit));
    
    // Get total count for pagination
    const total = await Recipe.countDocuments(filter);
    
    return res.status(200).json({ 
      recipes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error in getRecipes controller:', error);
    return res.status(500).json({ message: 'Server error while fetching recipes' });
  }
};

// Get a single recipe by ID
export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if recipe is published or if the requester is the creator/admin
    if (!recipe.isPublished && 
        req.user?.id !== recipe.createdBy && 
        req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied to this recipe' });
    }
    
    return res.status(200).json({ recipe });
  } catch (error) {
    console.error('Error in getRecipeById controller:', error);
    return res.status(500).json({ message: 'Server error while fetching recipe' });
  }
};

// Update a recipe
export const updateRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if user is authorized to update this recipe
    if (req.user?.id !== recipe.createdBy && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }
    
    // Handle arrays properly
    if (updateData.category && !Array.isArray(updateData.category)) {
      updateData.category = [updateData.category].filter(Boolean);
    }
    
    if (updateData.tags && !Array.isArray(updateData.tags)) {
      updateData.tags = [updateData.tags].filter(Boolean);
    }
    
    // Update the recipe
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      message: 'Recipe updated successfully',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error('Error in updateRecipe controller:', error);
    return res.status(500).json({ message: 'Server error while updating recipe' });
  }
};

// Delete a recipe
export const deleteRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if user is authorized to delete this recipe
    if (req.user?.id !== recipe.createdBy && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }
    
    // Delete from database
    await Recipe.findByIdAndDelete(id);
    
    return res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error in deleteRecipe controller:', error);
    return res.status(500).json({ message: 'Server error while deleting recipe' });
  }
};

// Flag a recipe as inappropriate (admin only)
export const flagRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isFlagged } = req.body;
    
    if (isFlagged === undefined) {
      return res.status(400).json({ message: 'isFlagged field is required' });
    }
    
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Update flag status
    recipe.isFlagged = isFlagged;
    await recipe.save();
    
    return res.status(200).json({
      message: `Recipe ${isFlagged ? 'flagged' : 'unflagged'} successfully`,
      recipe
    });
  } catch (error) {
    console.error('Error in flagRecipe controller:', error);
    return res.status(500).json({ message: 'Server error while flagging recipe' });
  }
};

// Get recipes by chef
export const getChefRecipes = async (req: Request, res: Response) => {
  try {
    const { chefId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const recipes = await Recipe.find({ createdBy: chefId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Recipe.countDocuments({ createdBy: chefId });
    
    return res.status(200).json({ 
      recipes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error in getChefRecipes controller:', error);
    return res.status(500).json({ message: 'Server error while fetching chef recipes' });
  }
};

// Get recipes by region
export const getRecipesByRegion = async (req: Request, res: Response) => {
  try {
    const { region } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const recipes = await Recipe.find({ region, isPublished: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Recipe.countDocuments({ region, isPublished: true });
    
    return res.status(200).json({ 
      recipes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error in getRecipesByRegion controller:', error);
    return res.status(500).json({ message: 'Server error while fetching regional recipes' });
  }
};

// Get recipes by allergen (or allergen-free)
export const getAllergenRecipes = async (req: Request, res: Response) => {
  try {
    const { allergen } = req.params;
    const { free = 'false', page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // If free=true, find recipes WITHOUT the allergen
    // If free=false, find recipes WITH the allergen
    const allergenFilter = free === 'true'
      ? { 'ingredients.name': { $not: { $regex: new RegExp(allergen, 'i') } } }
      : { 'ingredients.name': { $regex: new RegExp(allergen, 'i') }, 'ingredients.isAllergen': true };
    
    const recipes = await Recipe.find({ ...allergenFilter, isPublished: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Recipe.countDocuments({ ...allergenFilter, isPublished: true });
    
    return res.status(200).json({ 
      recipes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error in getAllergenRecipes controller:', error);
    return res.status(500).json({ message: 'Server error while fetching allergen recipes' });
  }
};