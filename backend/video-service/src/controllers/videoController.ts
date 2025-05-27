import { Request, Response } from 'express';
import Video, { IVideo } from '../models/Video';
import { bucket } from '../config/firebas';

// Upload a new video
export const uploadVideo = async (req: Request, res: Response) => {
  try {
    if (!req.fileUrl) {
      return res.status(400).json({ message: 'Video upload failed' });
    }

    const { title, description, recipeId, region, category } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Create a new video document
    const video = new Video({
      title,
      description,
      url: req.fileUrl,
      uploadedBy: req.user?.id,
      recipeId,
      region,
      category,
      isPublished: true,
      isFlagged: false
    });

    // Save to database
    await video.save();

    return res.status(201).json({
      message: 'Video uploaded successfully',
      video
    });
  } catch (error) {
    console.error('Error in uploadVideo controller:', error);
    return res.status(500).json({ message: 'Server error during video upload' });
  }
};

// Get all videos with optional filtering
export const getVideos = async (req: Request, res: Response) => {
  try {
    const { region, category, recipeId } = req.query;
    
    // Build filter object
    const filter: any = { isPublished: true };
    
    if (region) filter.region = region;
    if (category) filter.category = category;
    if (recipeId) filter.recipeId = recipeId;
    
    // Find videos matching the filter
    const videos = await Video.find(filter).sort({ createdAt: -1 });
    
    return res.status(200).json({ videos });
  } catch (error) {
    console.error('Error in getVideos controller:', error);
    return res.status(500).json({ message: 'Server error while fetching videos' });
  }
};

// Get a single video by ID
export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if video is published or if the requester is the uploader/admin
    if (!video.isPublished && 
        req.user?.id !== video.uploadedBy && 
        req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied to this video' });
    }
    
    return res.status(200).json({ video });
  } catch (error) {
    console.error('Error in getVideoById controller:', error);
    return res.status(500).json({ message: 'Server error while fetching video' });
  }
};

// Update a video
export const updateVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, region, category, isPublished } = req.body;
    
    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if user is authorized to update this video
    if (req.user?.id !== video.uploadedBy && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this video' });
    }
    
    // Update fields
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (region) video.region = region;
    if (category) video.category = category;
    if (isPublished !== undefined && (req.user?.id === video.uploadedBy || req.user?.role === 'admin')) {
      video.isPublished = isPublished;
    }
    
    await video.save();
    
    return res.status(200).json({
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    console.error('Error in updateVideo controller:', error);
    return res.status(500).json({ message: 'Server error while updating video' });
  }
};

// Delete a video
export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if user is authorized to delete this video
    if (req.user?.id !== video.uploadedBy && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }
    
    // Delete from Firebase Storage
    try {
      // Extract filename from URL
      const urlParts = video.url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Delete file from Firebase
      await bucket.file(`videos/${filename}`).delete();
    } catch (error) {
      console.error('Error deleting file from Firebase:', error);
      // Continue with database deletion even if Firebase deletion fails
    }
    
    // Delete from database
    await Video.findByIdAndDelete(id);
    
    return res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error in deleteVideo controller:', error);
    return res.status(500).json({ message: 'Server error while deleting video' });
  }
};

// Flag a video as inappropriate (admin only)
export const flagVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isFlagged } = req.body;
    
    if (isFlagged === undefined) {
      return res.status(400).json({ message: 'isFlagged field is required' });
    }
    
    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Update flag status
    video.isFlagged = isFlagged;
    await video.save();
    
    return res.status(200).json({
      message: `Video ${isFlagged ? 'flagged' : 'unflagged'} successfully`,
      video
    });
  } catch (error) {
    console.error('Error in flagVideo controller:', error);
    return res.status(500).json({ message: 'Server error while flagging video' });
  }
};

// Get videos uploaded by a specific chef
export const getChefVideos = async (req: Request, res: Response) => {
  try {
    const { chefId } = req.params;
    
    const videos = await Video.find({ uploadedBy: chefId }).sort({ createdAt: -1 });
    
    return res.status(200).json({ videos });
  } catch (error) {
    console.error('Error in getChefVideos controller:', error);
    return res.status(500).json({ message: 'Server error while fetching chef videos' });
  }
};

// Get user's favorite videos
export const getFavoriteVideos = async (req: Request, res: Response) => {
  try {
    // This would typically involve a separate collection for user favorites
    // For now, we'll return a placeholder response
    return res.status(200).json({ 
      message: 'This endpoint would return favorite videos from a user_favorites collection',
      videos: []
    });
  } catch (error) {
    console.error('Error in getFavoriteVideos controller:', error);
    return res.status(500).json({ message: 'Server error while fetching favorite videos' });
  }
};