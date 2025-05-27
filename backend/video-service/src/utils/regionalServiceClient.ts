import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Regional service base URL (should be in environment variables in a real application)
const REGIONAL_SERVICE_URL = process.env.REGIONAL_SERVICE_URL || 'http://localhost:5004/api';

/**
 * Client for interacting with the Regional Service
 */
export class RegionalServiceClient {
  /**
   * Get all regions
   * @returns Promise resolving to an array of regions
   */
  static async getRegions(): Promise<any[]> {
    try {
      const response = await axios.get(`${REGIONAL_SERVICE_URL}/regions`);
      return response.data.regions || [];
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw new Error('Failed to fetch regions');
    }
  }

  /**
   * Check if a region exists
   * @param regionId - ID or name of the region
   * @returns Promise resolving to a boolean indicating if the region exists
   */
  static async regionExists(regionId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${REGIONAL_SERVICE_URL}/regions/${regionId}`);
      return !!response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      console.error('Error checking if region exists:', error);
      throw new Error('Failed to check if region exists');
    }
  }

  /**
   * Get categories for a specific region
   * @param regionId - ID of the region
   * @returns Promise resolving to an array of categories
   */
  static async getRegionCategories(regionId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${REGIONAL_SERVICE_URL}/regions/${regionId}/categories`);
      return response.data.categories || [];
    } catch (error) {
      console.error('Error fetching region categories:', error);
      throw new Error('Failed to fetch region categories');
    }
  }

  /**
   * Add a video to a region's collection
   * @param regionId - ID of the region
   * @param videoId - ID of the video
   * @returns Promise resolving to the updated region
   */
  static async addVideoToRegion(regionId: string, videoId: string): Promise<any> {
    try {
      const response = await axios.post(`${REGIONAL_SERVICE_URL}/regions/${regionId}/videos`, {
        videoId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding video to region:', error);
      throw new Error('Failed to add video to region');
    }
  }
}