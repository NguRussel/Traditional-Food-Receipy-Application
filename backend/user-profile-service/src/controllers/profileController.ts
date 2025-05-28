import UserProfile from '../models/UserProfile';
import { Request, Response } from 'express';

export const getProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const profile = await UserProfile.findOne({ userId });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
};

export const updateProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const updates = req.body;
  const profile = await UserProfile.findOneAndUpdate({ userId }, updates, { new: true, upsert: true });
  res.json(profile);
};

export const addFavorite = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { recipeId } = req.body;
  const profile = await UserProfile.findOneAndUpdate(
    { userId },
    { $addToSet: { favoriteRecipes: recipeId } },
    { new: true }
  );
  res.json(profile);
};

export const removeFavorite = async (req: Request, res: Response) => {
  const { userId, recipeId } = req.params;
  const profile = await UserProfile.findOneAndUpdate(
    { userId },
    { $pull: { favoriteRecipes: recipeId } },
    { new: true }
  );
  res.json(profile);
};