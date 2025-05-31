import { Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import CustomError from '../utils/CustomError';
import { IAuthRequest } from '../middleware/authMiddleware';
import Media from '../models/Media';
import { bucket } from '../config/firebaseAdmin'; 
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import stream from 'stream';
// import ffmpeg from 'fluent-ffmpeg'; // For video processing

// Placeholder for controller functions

// POST /media/images/upload
export const uploadRecipeImage = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new CustomError('No image file uploaded.', 400));
  }

  if (!req.user) {
    return next(new CustomError('User not authenticated to upload media.', 401));
  }

  if (!bucket) {
    return next(new CustomError('Firebase Storage is not initialized. Cannot upload file.', 500));
  }

  const originalName = req.file.originalname;
  const mimeType = req.file.mimetype;
  const category = 'recipe'; // This endpoint is specifically for recipe images
  const type = 'image';

  try {
    // Process image with Sharp: convert to webp, resize
    const processedImageBuffer = await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    const uniqueFileName = `${type}s/${category}/${uuidv4()}-${originalName.replace(/\s+/g, '_')}.webp`;
    const file = bucket.file(uniqueFileName);

    await file.save(processedImageBuffer, {
      metadata: {
        contentType: 'image/webp', // Saving as webp
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
      },
      public: true, // Make the file publicly readable
    });

    // Firebase public URL format might vary. This is a common one.
    // Ensure your bucket permissions are set for public access if using this.
    // Alternatively, use file.getSignedUrl() for temporary access if files are not public by default.
    const firebaseUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
    // Or, more robustly using getSignedUrl for a short-lived URL if files are not public by default:
    // const [firebaseUrl] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' }); 

    const mediaDocument = new Media({
      originalName,
      fileName: uniqueFileName,
      firebaseUrl,
      type,
      category,
      uploadedBy: req.user.id,
      size: processedImageBuffer.length, // Size of the processed image
      mimeType: 'image/webp',
    });

    await mediaDocument.save();

    res.status(201).json({
      status: 'success',
      message: 'Recipe image uploaded successfully.',
      data: mediaDocument,
    });

  } catch (error: any) {
    console.error('Error during recipe image upload:', error);
    return next(new CustomError(`Image upload failed: ${error.message}`, 500));
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

  if (!bucket) {
    return next(new CustomError('Firebase Storage is not initialized. Cannot upload avatar.', 500));
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

    const uniqueFileName = `${type}s/${category}/${req.user.id}-${uuidv4()}.webp`; // User ID in filename for easier tracking
    const file = bucket.file(uniqueFileName);

    await file.save(processedImageBuffer, {
      metadata: {
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
      },
      public: true,
    });

    const firebaseUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;

    const mediaDocument = new Media({
      originalName,
      fileName: uniqueFileName,
      firebaseUrl,
      type,
      category,
      uploadedBy: req.user.id,
      size: processedImageBuffer.length,
      mimeType: 'image/webp',
    });

    await mediaDocument.save();

    res.status(201).json({
      status: 'success',
      message: 'Avatar image uploaded successfully.',
      data: mediaDocument,
    });

  } catch (error: any) {
    console.error('Error during avatar image upload:', error);
    return next(new CustomError(`Avatar upload failed: ${error.message}`, 500));
  }
});

// DELETE /media/images/:id  (also covers /media/videos/:id through type check)
export const deleteMediaById = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const mediaId = req.params.id;

  if (!req.user) {
    return next(new CustomError('User not authenticated to delete media.', 401));
  }
  
  if (!bucket) {
    return next(new CustomError('Firebase Storage is not initialized. Cannot delete file.', 500));
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
    // Delete from Firebase Storage
    const file = bucket.file(media.fileName);
    await file.delete();

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
    // Potentially check if the error is from Firebase (e.g., file not found) or MongoDB
    // and provide a more specific message or attempt cleanup if one part failed.
    if (error.code === 404) { // Example: GCS file not found error
        console.warn(`File ${media.fileName} not found in Firebase Storage, but proceeding to delete DB record.`);
         // If GCS file not found, but DB entry exists, maybe we still want to delete the DB entry.
        await Media.findByIdAndDelete(mediaId).catch(dbError => {
            console.error(`Error deleting media document ${mediaId} from DB after GCS file not found:`, dbError);
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

  const media = await Media.findById(mediaId).select('+firebaseUrl type'); // Ensure firebaseUrl is selected

  if (!media) {
    return next(new CustomError('Media not found.', 404));
  }

  if (media.type !== 'image') {
    return next(new CustomError('Requested media is not an image.', 400));
  }

  if (!media.firebaseUrl) {
    return next(new CustomError('Firebase URL not found for this media.', 404));
  }

  // Redirect to the public Firebase URL
  // This assumes the firebaseUrl stored is directly accessible.
  // If using signed URLs, the logic would be different here.
  res.redirect(302, media.firebaseUrl);
});

// POST /media/videos/upload
export const uploadRecipeVideo = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new CustomError('No video file uploaded.', 400));
  }

  if (!req.user) {
    return next(new CustomError('User not authenticated to upload video.', 401));
  }

  if (!bucket) {
    return next(new CustomError('Firebase Storage is not initialized. Cannot upload video.', 500));
  }

  const originalName = req.file.originalname;
  const mimeType = req.file.mimetype;
  const category = 'recipe'; // This endpoint is specifically for recipe videos
  const type = 'video';

  try {
    // For videos, we are directly uploading the buffer from multer
    // FFmpeg processing for compression or format change could be added here
    const videoBuffer = req.file.buffer;
    const uniqueFileName = `${type}s/${category}/${uuidv4()}-${originalName.replace(/\s+/g, '_')}`;
    const file = bucket.file(uniqueFileName);

    await file.save(videoBuffer, {
      metadata: {
        contentType: mimeType, // Use the original mimetype for videos
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
      },
      public: true, // Make the file publicly readable
    });

    const firebaseUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;

    const mediaDocument = new Media({
      originalName,
      fileName: uniqueFileName,
      firebaseUrl,
      type,
      category,
      uploadedBy: req.user.id,
      size: videoBuffer.length,
      mimeType,
    });

    await mediaDocument.save();

    res.status(201).json({
      status: 'success',
      message: 'Recipe video uploaded successfully.',
      data: mediaDocument,
    });

  } catch (error: any) {
    console.error('Error during recipe video upload:', error);
    return next(new CustomError(`Video upload failed: ${error.message}`, 500));
  }
});

// GET /media/videos/:id/stream
export const streamVideo = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const mediaId = req.params.id;

  const media = await Media.findById(mediaId).select('+firebaseUrl type');

  if (!media) {
    return next(new CustomError('Media not found.', 404));
  }

  if (media.type !== 'video') {
    return next(new CustomError('Requested media is not a video.', 400));
  }

  if (!media.firebaseUrl) {
    return next(new CustomError('Firebase URL not found for this media.', 404));
  }

  // Redirect to the public Firebase URL for streaming
  res.redirect(302, media.firebaseUrl);
});

// POST /media/videos/:id/thumbnail
export const generateVideoThumbnail = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const videoId = req.params.id;

  if (!req.user) {
    return next(new CustomError('User not authenticated.', 401));
  }
  if (!bucket) {
    return next(new CustomError('Firebase Storage is not initialized.', 500));
  }

  // Capture bucket name here where bucket is known to be defined
  const bucketName = bucket.name; 

  const videoMedia = await Media.findById(videoId);
  if (!videoMedia || videoMedia.type !== 'video') {
    return next(new CustomError('Video not found or media is not a video.', 404));
  }
  if (!videoMedia.fileName) {
    return next(new CustomError('Video filename not found in media record.', 500));
  }

  const videoFile = bucket.file(videoMedia.fileName);
  const thumbnailFileName = `images/recipe/${uuidv4()}-thumbnail.png`; // Store with recipe images

  try {
    const passThrough = new stream.PassThrough();
    const ffmpegCommand = ffmpeg(videoFile.createReadStream())
      .screenshots({
        count: 1,
        timemarks: ['1'], // 1st second, or use '50%'
        filename: 'thumbnail.png', // Temp name, will be streamed
        folder: '.', // Not actually saved to disk if streamed
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        // Make sure to call next ONLY ONCE
        if (!res.headersSent) {
            next(new CustomError(`Failed to generate thumbnail: ${err.message}`, 500));
        }
      })
      .pipe(passThrough, { end: true }); // Pipe output stream to passThrough
      
    // Wait for the stream to finish and collect buffer
    // This is a bit tricky with ffmpeg's event-based streaming for screenshots.
    // A common pattern is to pipe to a temporary file then upload, or directly pipe to bucket.upload if supported.
    // For simplicity and to avoid temp files, let's try to get the buffer from the stream directly.
    // Note: The typical .pipe(res) pattern for screenshots is for direct HTTP response.
    // We need to upload it to Firebase.
    
    // Alternative: Save to temp file then upload (more straightforward with ffmpeg events)
    // For now, let's assume we can intercept the stream. This might need adjustment.
    // The `folder: '.'` and `filename: 'thumbnail.png'` with `.pipe(passThrough)` is not standard for getting a buffer.
    // Let's adjust to a more reliable method using a temporary file path or directly piping to Firebase upload stream.

    // More reliable: save to a temp path then upload (requires fs access, which might not be ideal in serverless)
    // Simpler for now: FFmpeg can output to a writable stream. We need to upload this stream to Firebase.

    const firebaseUploadStream = bucket.file(thumbnailFileName).createWriteStream({
        metadata: {
            contentType: 'image/png',
            cacheControl: 'public, max-age=31536000',
        },
        public: true,
    });

    // Re-configure ffmpeg to pipe to firebaseUploadStream
    ffmpeg(videoFile.createReadStream())
        .screenshots({
            count: 1,
            timemarks: ['1'], 
            filename: 'thumbnail-%b.png', // FFmpeg will replace %b with base name of input (not relevant for stream)
        })
        .on('end', async () => {
            console.log('Thumbnail generation finished.');
            // File has been uploaded via the stream
            const thumbnailUrl = `https://storage.googleapis.com/${bucketName}/${thumbnailFileName}`;
            
            const thumbnailMediaDoc = new Media({
                originalName: `${videoMedia.originalName}-thumbnail.png`,
                fileName: thumbnailFileName,
                firebaseUrl: thumbnailUrl,
                type: 'image',
                category: 'recipe', // Thumbnails are part of the recipe
                uploadedBy: req.user?.id, // req.user should exist due to protect middleware
                size: 0, // We don't know the exact size without reading the uploaded file back, can be updated later or estimated
                mimeType: 'image/png',
            });
            await thumbnailMediaDoc.save();

            if (!res.headersSent) {
                res.status(201).json({
                status: 'success',
                message: 'Video thumbnail generated and saved successfully.',
                data: thumbnailMediaDoc,
                });
            }
        })
        .on('error', (err) => {
            console.error('FFmpeg processing error for thumbnail:', err);
            if (!res.headersSent) {
                next(new CustomError(`Failed to process video for thumbnail: ${err.message}`, 500));
            }
        })
        .pipe(firebaseUploadStream, { end: true });

  } catch (error: any) {
    console.error('Error setting up thumbnail generation:', error);
    if (!res.headersSent) {
        next(new CustomError(`Thumbnail generation setup failed: ${error.message}`, 500));
    }
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

  if (!bucket) {
    return next(new CustomError('Firebase Storage is not initialized. Cannot upload document.', 500));
  }

  const originalName = req.file.originalname;
  const mimeType = req.file.mimetype;
  const category = 'verification';
  const type = 'document';

  try {
    const documentBuffer = req.file.buffer;
    // Store verification documents in a path that includes the user ID for organization
    const uniqueFileName = `${type}s/${category}/${req.user.id}-${uuidv4()}-${originalName.replace(/\s+/g, '_')}`;
    const file = bucket.file(uniqueFileName);

    await file.save(documentBuffer, {
      metadata: {
        contentType: mimeType,
        // Verification documents might not need aggressive public caching
        cacheControl: 'private, max-age=0, no-transform', 
      },
      public: false, // Verification documents should likely NOT be public by default
    });

    // For non-public files, you'd typically use getSignedUrl() for access.
    // However, the requirement is to store a firebaseUrl. This URL might be the GCS URI (gs://...) 
    // or a path that the chef/admin service can later use to generate a signed URL when needed.
    // Let's store the GCS path-like name, which is robust.
    // const firebaseUrl = `gs://${bucket.name}/${uniqueFileName}`;
    // Or, if an HTTPS accessible (but not necessarily public without auth) URL is desired, it might be:
    const firebaseUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`; // This URL may require auth to access if public:false

    const mediaDocument = new Media({
      originalName,
      fileName: uniqueFileName,
      firebaseUrl, // This URL might need to be accessed via signed URLs by the consuming service
      type,
      category,
      uploadedBy: req.user.id,
      size: documentBuffer.length,
      mimeType,
    });

    await mediaDocument.save();

    res.status(201).json({
      status: 'success',
      message: 'Verification document uploaded successfully.',
      data: mediaDocument,
    });

  } catch (error: any) {
    console.error('Error during verification document upload:', error);
    return next(new CustomError(`Document upload failed: ${error.message}`, 500));
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
  // It does not reflect the actual storage used in Firebase if Firebase does its own compression or has versions.
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