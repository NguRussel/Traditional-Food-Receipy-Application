import { Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import CustomError from '../utils/CustomError';
import { IAuthRequest } from '../middleware/authMiddleware';
import Media from '../models/Media';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import stream from 'stream';
import { s3Client, s3BucketName } from '../config/s3Client'; // AWS S3 client
import { Upload } from '@aws-sdk/lib-storage';
import { GetObjectCommand, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'; // S3 Commands
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // For signed URLs if needed

// Placeholder for controller functions

// POST /media/images/upload
export const uploadRecipeImage = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new CustomError('No image file uploaded.', 400));
  }
  if (!req.user) {
    return next(new CustomError('User not authenticated to upload media.', 401));
  }
  if (!s3Client || !s3BucketName) {
    return next(new CustomError('S3 client or bucket name is not initialized. Cannot upload file.', 500));
  }

  const originalName = req.file.originalname;
  const mimeType = req.file.mimetype;
  const category = 'recipe';
  const type = 'image';

  try {
    const processedImageBuffer = await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    const s3Key = `${type}s/${category}/${uuidv4()}-${originalName.replace(/\s+/g, '_')}.webp`;
    
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: s3BucketName,
        Key: s3Key,
        Body: processedImageBuffer,
        ContentType: 'image/webp',
        ACL: 'public-read', // Or manage permissions differently (e.g., private + signed URLs)
      },
    });

    const uploadResult = await upload.done();
    
    const s3Url = `https://${s3BucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    const mediaDocument = new Media({
      originalName,
      fileName: originalName, // Or use s3Key if that's more appropriate as 'fileName'
      s3Key,
      s3Url,
      type,
      category,
      uploadedBy: req.user.id,
      size: processedImageBuffer.length,
      mimeType: 'image/webp',
    });

    await mediaDocument.save();

    res.status(201).json({
      status: 'success',
      message: 'Recipe image uploaded successfully to S3.',
      data: mediaDocument,
    });

  } catch (error: any) {
    console.error('Error during recipe image S3 upload:', error);
    return next(new CustomError(`Image S3 upload failed: ${error.message}`, 500));
  }
});

// POST /media/images/avatar
export const uploadAvatar = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new CustomError('No image file uploaded for avatar.', 400));
  }

  if (!req.user) {
    return next(new CustomError('User not authenticated to upload avatar.', 401));
  }

  if (!s3Client || !s3BucketName) {
    return next(new CustomError('S3 client or bucket name is not initialized. Cannot upload avatar.', 500));
  }

  const originalName = req.file.originalname;
  const category = 'profile'; // Category is 'profile' for avatars
  const type = 'image';

  try {
    // Process image with Sharp: convert to webp, resize for avatar
    const processedImageBuffer = await sharp(req.file.buffer)
      .webp({ quality: 85 }) // Slightly higher quality for avatars potentially
      .resize({ width: 300, height: 300, fit: 'cover' }) // Square, cover for avatars
      .toBuffer();

    const s3Key = `${type}s/${category}/${req.user.id}-${uuidv4()}.webp`; // User ID in filename for easier tracking
    
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: s3BucketName,
        Key: s3Key,
        Body: processedImageBuffer,
        ContentType: 'image/webp',
        ACL: 'public-read', // Or manage permissions differently (e.g., private + signed URLs)
      },
    });

    const uploadResult = await upload.done();
    
    const s3Url = `https://${s3BucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    const mediaDocument = new Media({
      originalName,
      fileName: originalName, // Or use s3Key if that's more appropriate as 'fileName'
      s3Key,
      s3Url,
      type,
      category,
      uploadedBy: req.user.id,
      size: processedImageBuffer.length,
      mimeType: 'image/webp',
    });

    await mediaDocument.save();

    res.status(201).json({
      status: 'success',
      message: 'Avatar image uploaded successfully to S3.',
      data: mediaDocument,
    });

  } catch (error: any) {
    console.error('Error during avatar image S3 upload:', error);
    return next(new CustomError(`Avatar S3 upload failed: ${error.message}`, 500));
  }
});

// DELETE /media/images/:id  (also covers /media/videos/:id through type check)
export const deleteMediaById = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const mediaId = req.params.id;

  if (!req.user) {
    return next(new CustomError('User not authenticated to delete media.', 401));
  }
  
  if (!s3Client || !s3BucketName) {
    return next(new CustomError('S3 client or bucket name is not initialized. Cannot delete file.', 500));
  }

  const media = await Media.findById(mediaId);

  if (!media) {
    return next(new CustomError('Media not found.', 404));
  }

  // Check ownership or admin role
  const isAdmin = req.user.roles.includes('admin');
  const isOwner = media.uploadedBy.toString() === req.user.id;

  if (!isAdmin && !isOwner) {
    return next(new CustomError('You are not authorized to delete this media.', 403));
  }

  try {
    // Delete from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: s3BucketName,
      Key: media.s3Key,
    });
    await s3Client.send(deleteCommand);

    // Delete Media document from MongoDB
    await Media.findByIdAndDelete(mediaId);
    // Or use media.deleteOne() if you prefer instance method and have the full document

    res.status(200).json({
      status: 'success',
      message: 'Media deleted successfully.',
      data: null, // Or return the deleted media document if needed
    });

  } catch (error: any) {
    console.error(`Error deleting media with ID ${mediaId}:`, error);
    if (error.code === 404) { 
        console.warn(`File ${media.s3Key} not found in S3, but proceeding to delete DB record.`);
        await Media.findByIdAndDelete(mediaId).catch(dbError => {
            console.error(`Error deleting media document ${mediaId} from DB after S3 file not found:`, dbError);
            // If DB deletion also fails, this becomes a more complex error state.
        });
        return res.status(200).json({
            status: 'success',
            message: 'Media record deleted from database. File was not found in storage.',
            data: null,
        });
    }
    return next(new CustomError(`Failed to delete media: ${error.message}`, 500));
  }
});

// GET /media/images/:id/optimized
export const getOptimizedImage = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const mediaId = req.params.id;

  const media = await Media.findById(mediaId).select('+s3Url type'); // Ensure s3Url is selected

  if (!media) {
    return next(new CustomError('Media not found.', 404));
  }

  if (media.type !== 'image') {
    return next(new CustomError('Requested media is not an image.', 400));
  }

  if (!media.s3Url) {
    return next(new CustomError('S3 URL not found for this media.', 404));
  }

  // Redirect to the public S3 URL
  // This assumes the s3Url stored is directly accessible.
  // If using signed URLs, the logic would be different here.
  res.redirect(302, media.s3Url);
});

// POST /media/videos/upload
export const uploadRecipeVideo = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new CustomError('No video file uploaded.', 400));
  }

  if (!req.user) {
    return next(new CustomError('User not authenticated to upload video.', 401));
  }

  if (!s3Client || !s3BucketName) {
    return next(new CustomError('S3 client or bucket name is not initialized. Cannot upload video.', 500));
  }

  const originalName = req.file.originalname;
  const mimeType = req.file.mimetype;
  const category = 'recipe'; // This endpoint is specifically for recipe videos
  const type = 'video';

  try {
    // For videos, we are directly uploading the buffer from multer
    // FFmpeg processing for compression or format change could be added here
    const videoBuffer = req.file.buffer;
    const s3Key = `${type}s/${category}/${uuidv4()}-${originalName.replace(/\s+/g, '_')}`;
    
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: s3BucketName,
        Key: s3Key,
        Body: videoBuffer,
        ContentType: mimeType,
        ACL: 'public-read',
      },
    });

    const uploadResult = await upload.done();
    
    const s3Url = `https://${s3BucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    const mediaDocument = new Media({
      originalName,
      fileName: originalName, // Or use s3Key if that's more appropriate as 'fileName'
      s3Key,
      s3Url,
      type,
      category,
      uploadedBy: req.user.id,
      size: videoBuffer.length,
      mimeType,
    });

    await mediaDocument.save();

    res.status(201).json({
      status: 'success',
      message: 'Recipe video uploaded successfully to S3.',
      data: mediaDocument,
    });

  } catch (error: any) {
    console.error('Error during recipe video S3 upload:', error);
    // Check for AWS SDK specific errors if needed
    // if (error instanceof S3ServiceException) { ... }
    return next(new CustomError(`Video S3 upload failed: ${error.message}`, 500));
  }
});

// GET /media/videos/:id/stream
export const streamVideo = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const mediaId = req.params.id;
  const media = await Media.findById(mediaId).select('+s3Url type'); // Ensure s3Url is selected

  if (!media) {
    return next(new CustomError('Media not found.', 404));
  }

  if (media.type !== 'video') {
    return next(new CustomError('Requested media is not a video.', 400));
  }

  if (!media.s3Url) {
    return next(new CustomError('S3 URL not found for this media.', 404));
  }

  // Redirect to the public S3 URL for streaming
  // This assumes the s3Url stored is directly accessible and the S3 object has appropriate permissions (e.g., public-read)
  // For private content, you would generate a pre-signed URL here.
  res.redirect(302, media.s3Url);
});

// POST /media/videos/:id/thumbnail
export const generateVideoThumbnail = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const videoId = req.params.id;
  if (!req.user) {
    return next(new CustomError('User not authenticated.', 401));
  }
  if (!s3Client || !s3BucketName) {
    return next(new CustomError('S3 client or bucket name is not initialized.', 500));
  }

  const videoMedia = await Media.findById(videoId);
  if (!videoMedia || videoMedia.type !== 'video') {
    return next(new CustomError('Video not found or media is not a video.', 404));
  }
  if (!videoMedia.s3Key) {
    return next(new CustomError('S3 key not found for the video.', 500));
  }

  const thumbnailS3Key = `images/recipe/${uuidv4()}-thumbnail.png`;
  const passThroughStream = new stream.PassThrough();

  // 1. Prepare S3 upload for the thumbnail
  const s3ThumbnailUpload = new Upload({
    client: s3Client,
    params: {
      Bucket: s3BucketName,
      Key: thumbnailS3Key,
      Body: passThroughStream,
      ContentType: 'image/png',
      ACL: 'public-read',
    },
  });

  try {
    // 2. Get video from S3 as a stream
    const getVideoCommand = new GetObjectCommand({
      Bucket: s3BucketName,
      Key: videoMedia.s3Key,
    });
    const s3ObjectResponse = await s3Client.send(getVideoCommand);

    if (!s3ObjectResponse.Body || !(s3ObjectResponse.Body instanceof stream.Readable)) {
        return next(new CustomError('Could not retrieve video stream from S3.', 500));
    }
    const videoS3Stream = s3ObjectResponse.Body as stream.Readable;

    // 3. Process with FFmpeg and pipe to S3 upload stream
    ffmpeg(videoS3Stream) // Input the S3 stream to FFmpeg
      .screenshots({
        count: 1,
        timemarks: ['10%'], // Take screenshot at 10% of video duration
        filename: 'thumbnail.png', // Temporary filename, output is piped
        size: '320x240',
      })
      .on('error', (err: Error) => {
        console.error('FFmpeg error during thumbnail generation:', err);
        // Ensure passThroughStream is destroyed to prevent upload hanging or errors
        passThroughStream.destroy(new Error(`FFmpeg failed: ${err.message}`)); 
        // Note: The s3ThumbnailUpload.done() promise below might reject or hang
        // if the stream is destroyed. Error handling for s3ThumbnailUpload is also important.
        // We might not call next() here if we want the main try-catch to handle it after s3ThumbnailUpload.done() fails.
      })
      .pipe(passThroughStream, { end: true }); // Pipe FFmpeg output to the S3 upload stream

    // 4. Wait for S3 upload to complete
    await s3ThumbnailUpload.done();

    const thumbnailUrl = `https://${s3BucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailS3Key}`;

    const thumbnailMediaDoc = new Media({
      originalName: `${videoMedia.originalName}-thumbnail.png`,
      fileName: thumbnailS3Key, // Using S3 key as fileName
      s3Key: thumbnailS3Key,
      s3Url: thumbnailUrl,
      type: 'image',
      category: 'recipe', // Thumbnails are part of the recipe
      uploadedBy: req.user.id, // Should be the user who owns the video or an admin
      size: 0, // Placeholder, S3 upload result might provide size, or we estimate
      mimeType: 'image/png',
      status: 'active',
    });
    // Optionally, get actual size from s3ThumbnailUpload.done() result if available or a HEAD request.
    // For now, setting size to 0 or omitting and making it optional in schema.

    await thumbnailMediaDoc.save();

    res.status(201).json({
      status: 'success',
      message: 'Video thumbnail generated and uploaded to S3 successfully.',
      data: thumbnailMediaDoc,
    });

  } catch (error: any) {
    console.error('Error generating video thumbnail:', error);
    // If passThroughStream was used and an error occurred, ensure it's destroyed.
    if (!passThroughStream.destroyed) {
        passThroughStream.destroy(error instanceof Error ? error : new Error(String(error)));
    }
    return next(new CustomError(`Video thumbnail generation failed: ${error.message}`, 500));
  }
});

// POST /media/documents/upload
export const uploadVerificationDocument = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new CustomError('No document file uploaded.', 400));
  }

  if (!req.user) {
    // This route is protected and authorize(['chef', 'admin']) is used in routes,
    // so req.user should exist. This is an extra safeguard.
    return next(new CustomError('User not authenticated to upload verification document.', 401));
  }

  if (!s3Client || !s3BucketName) {
    return next(new CustomError('S3 client or bucket name is not initialized. Cannot upload document.', 500));
  }

  const originalName = req.file.originalname;
  const mimeType = req.file.mimetype;
  const category = 'verification';
  const type = 'document';

  try {
    const documentBuffer = req.file.buffer;
    // Store verification documents in a path that includes the user ID for organization
    const s3Key = `${type}s/${category}/${req.user.id}-${uuidv4()}-${originalName.replace(/\s+/g, '_')}`;
    
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: s3BucketName,
        Key: s3Key,
        Body: documentBuffer,
        ContentType: mimeType,
        ACL: 'private', // Verification documents should likely NOT be public by default
      },
    });

    const uploadResult = await upload.done();
    
    const s3Url = `https://${s3BucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    const mediaDocument = new Media({
      originalName,
      fileName: originalName, // Or use s3Key if that's more appropriate as 'fileName'
      s3Key,
      s3Url, // This URL might need to be accessed via signed URLs by the consuming service
      type,
      category,
      uploadedBy: req.user.id,
      size: documentBuffer.length,
      mimeType,
    });

    await mediaDocument.save();

    res.status(201).json({
      status: 'success',
      message: 'Verification document uploaded successfully to S3.',
      data: mediaDocument,
    });

  } catch (error: any) {
    console.error('Error during document S3 upload:', error);
    return next(new CustomError(`Document S3 upload failed: ${error.message}`, 500));
  }
});

// --- Admin Specific --- 

// GET /media/flagged
export const getFlaggedMedia = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  // Admin authorization is handled by middleware
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const skip = (page - 1) * limit;

  const flaggedMedia = await Media.find({ status: 'flagged' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalFlaggedMedia = await Media.countDocuments({ status: 'flagged' });

  res.status(200).json({
    status: 'success',
    message: 'Flagged media retrieved successfully.',
    data: flaggedMedia,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalFlaggedMedia / limit),
      totalItems: totalFlaggedMedia,
      itemsPerPage: limit,
    },
  });
});

// PUT /media/:id/moderate
export const moderateMedia = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  // Admin authorization is handled by middleware
  // Validation of req.body (status, flaggedReason) is handled by validationMiddleware
  const mediaId = req.params.id;
  const { status, flaggedReason } = req.body;

  const media = await Media.findById(mediaId);

  if (!media) {
    return next(new CustomError('Media not found.', 404));
  }

  // Update fields
  media.status = status;
  if (status === 'flagged' && flaggedReason) {
    media.flaggedReason = flaggedReason;
  } else if (status !== 'flagged') {
    media.flaggedReason = undefined; // Clear reason if not flagged
  }
  // Potentially add moderatedBy and moderatedAt fields if they were in the model
  // media.moderatedBy = req.user?.id;
  // media.moderatedAt = new Date();

  const updatedMedia = await media.save();

  res.status(200).json({
    status: 'success',
    message: 'Media moderated successfully.',
    data: updatedMedia,
  });
});

// GET /media/statistics
export const getMediaStatistics = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  // Admin authorization is handled by middleware

  const totalMedia = await Media.countDocuments();

  const mediaByType = await Media.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const mediaByCategory = await Media.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  
  const mediaByStatus = await Media.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Calculate total storage size (sum of 'size' field from all documents)
  // Note: This is the size of the files as recorded at upload time (e.g. processed image size, original video/doc size)
  // It does not reflect the actual storage used in S3 if S3 does its own compression or has versions.
  const totalStorageResult = await Media.aggregate([
    { $group: { _id: null, totalSize: { $sum: '$size' } } },
  ]);
  const totalStorageBytes = totalStorageResult.length > 0 ? totalStorageResult[0].totalSize : 0;


  res.status(200).json({
    status: 'success',
    message: 'Media statistics retrieved successfully.',
    data: {
      totalMedia,
      totalStorageBytes, // in bytes
      mediaByType: mediaByType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      mediaByCategory: mediaByCategory.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      mediaByStatus: mediaByStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
    },
  });
}); 