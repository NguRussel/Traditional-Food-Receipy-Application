import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Recipe service base URL (should be in environment variables in a real application)
const RECIPE_SERVICE_URL = process.env.RECIPE_SERVICE_URL || 'http://localhost:5002/api';

/**
 * Client for interacting with the Recipe Service
 */
export class RecipeServiceClient {
  /**
   * Link a video to a recipe
   * @param recipeId - ID of the recipe
   * @param videoId - ID of the video
   * @returns Promise resolving to the updated recipe
   */
  static async linkVideoToRecipe(recipeId: string, videoId: string): Promise<any> {
    try {
      const response = await axios.post(`${RECIPE_SERVICE_URL}/recipes/${recipeId}/videos`, {
        videoId
      });
      return response.data;
    } catch (error) {
      console.error('Error linking video to recipe:', error);
      throw new Error('Failed to link video to recipe');
    }
  }

  /**
   * Unlink a video from a recipe
   * @param recipeId - ID of the recipe
   * @param videoId - ID of the video
   * @returns Promise resolving to the updated recipe
   */
  static async unlinkVideoFromRecipe(recipeId: string, videoId: string): Promise<any> {
    try {
      const response = await axios.delete(`${RECIPE_SERVICE_URL}/recipes/${recipeId}/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error unlinking video from recipe:', error);
      throw new Error('Failed to unlink video from recipe');
    }
  }

  /**
   * Check if a recipe exists
   * @param recipeId - ID of the recipe
   * @returns Promise resolving to a boolean indicating if the recipe exists
   */
  static async recipeExists(recipeId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${RECIPE_SERVICE_URL}/recipes/${recipeId}`);
      return !!response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      console.error('Error checking if recipe exists:', error);
      throw new Error('Failed to check if recipe exists');
    }
  }
}