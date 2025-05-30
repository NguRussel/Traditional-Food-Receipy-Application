import request from 'supertest';
import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Types } from 'mongoose'; // Import Types
import reviewRoutes from '../reviewRoutes'; // The router we're testing
import ReviewModel from '../../models/Review';
import { IAuthRequest, AuthError } from '../../middleware/authMiddleware';
import CustomError from '../../utils/CustomError';

// Mock the Mongoose model
jest.mock('../../models/Review');

// Mock auth middleware
// We'll simulate the effect of protect: adds req.user
// We can also mock authorize if a route uses it specifically
jest.mock('../../middleware/authMiddleware', () => ({
  ...jest.requireActual('../../middleware/authMiddleware'),
  protect: (req: IAuthRequest, res: Response, next: NextFunction) => {
    // Simulate protect: add req.user if headers are present, or call next with error
    const userId = req.headers['x-user-id'] as string;
    const userRoles = req.headers['x-user-roles'] as string;
    if (userId && Types.ObjectId.isValid(userId)) { // Also check if userId is a valid MongoId for mock
      req.user = { id: userId, roles: userRoles ? userRoles.split(',') : [] };
      next();
    } else {
      // If tests need to check unauthenticated, they should not provide x-user-id
      // This simplified mock will assume x-user-id means authenticated for route tests
      // For specific auth middleware unit tests, we test AuthError cases.
      next(new AuthError('Mock protect: User ID missing or invalid', 401));
    }
  },
  authorize: (allowedRoles: string[]) => (req: IAuthRequest, res: Response, next: NextFunction) => {
    // Simplified authorize mock for route tests
    if (req.user && req.user.roles.some(role => allowedRoles.includes(role))) {
      next();
    } else {
      next(new AuthError('Mock authorize: Forbidden', 403));
    }
  },
}));

const app: Express = express();
app.use(express.json());
app.use('/api/v1/reviews', reviewRoutes);

// Minimal global error handler for testing purposes
const testErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // console.error("Test Error Handler caught:", err.message); // Optional: for debugging
  if (err instanceof AuthError || err instanceof CustomError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
  } else if (err.errors && Array.isArray(err.errors)) { // express-validator like error
    res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
  } else {
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};
app.use(testErrorHandler);


describe('Review Routes - /api/v1/reviews', () => {
  const mockUserId = new Types.ObjectId().toHexString(); // Valid MongoID string
  const mockRecipeId = new Types.ObjectId().toHexString(); // Valid MongoID string

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // We can also reset specific mock implementations if needed
    (ReviewModel.create as jest.Mock).mockReset();
  });

  describe('POST /', () => {
    // reviewData is dynamic now because mockRecipeId changes each test run if defined outside
    const getReviewData = () => ({
      recipeId: mockRecipeId,
      rating: 5,
      comment: 'Excellent recipe!',
    });

    it('should create a new review with valid data and authentication', async () => {
      const currentReviewData = getReviewData();
      const createdReview = {
        _id: new Types.ObjectId().toHexString(),
        ...currentReviewData,
        userId: mockUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (ReviewModel.create as jest.Mock).mockResolvedValue(createdReview);

      const response = await request(app)
        .post('/api/v1/reviews')
        .set('x-user-id', mockUserId)
        .set('x-user-roles', 'user')
        .send(currentReviewData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Review created successfully');
      expect(response.body.data).toEqual(createdReview);
      expect(ReviewModel.create).toHaveBeenCalledWith(expect.objectContaining({
        ...currentReviewData,
        userId: new Types.ObjectId(mockUserId),
        recipeId: new Types.ObjectId(mockRecipeId),
      }));
    });

    it('should return 401 if user is not authenticated (no x-user-id)', async () => {
        const response = await request(app)
            .post('/api/v1/reviews')
            .send(getReviewData());

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Mock protect: User ID missing or invalid');
    });

    it('should return 400 for missing recipeId', async () => {
      const { recipeId, ...invalidData } = getReviewData(); 
      const response = await request(app)
        .post('/api/v1/reviews')
        .set('x-user-id', mockUserId)
        .set('x-user-roles', 'user')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      // The order of errors might change if multiple fields are invalid.
      // It's safer to check if the specific error exists in the array.
      expect(response.body.errors.some((e: any) => e.msg === 'Recipe ID is required.')).toBe(true);
    });

    it('should return 400 for invalid rating (too high)', async () => {
      const invalidData = { ...getReviewData(), rating: 6 };
      const response = await request(app)
        .post('/api/v1/reviews')
        .set('x-user-id', mockUserId)
        .set('x-user-roles', 'user')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors.some((e: any) => e.msg === 'Rating must be a number between 1 and 5.')).toBe(true);
    });

    it('should return 400 for invalid comment (too long)', async () => {
        const invalidData = { ...getReviewData(), comment: 'a'.repeat(1001) };
        const response = await request(app)
          .post('/api/v1/reviews')
          .set('x-user-id', mockUserId)
          .set('x-user-roles', 'user')
          .send(invalidData);
  
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors.some((e: any) => e.msg === 'Comment cannot exceed 1000 characters.')).toBe(true);
      });

    it('should handle database error during review creation', async () => {
      (ReviewModel.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/v1/reviews')
        .set('x-user-id', mockUserId)
        .set('x-user-roles', 'user')
        .send(getReviewData());

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database error');
    });
  });

  describe('GET /recipe/:recipeId', () => {
    it('should return reviews for a given recipeId with pagination', async () => {
      const mockReviews = [
        { _id: 'review1', recipeId: mockRecipeId, userId: 'user1', rating: 5, comment: 'Great!' },
        { _id: 'review2', recipeId: mockRecipeId, userId: 'user2', rating: 4, comment: 'Good.' },
      ];
      (ReviewModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockReviews),
      });
      (ReviewModel.countDocuments as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .get(`/api/v1/reviews/recipe/${mockRecipeId}?page=1&limit=5`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.totalReviews).toBe(2);
      expect(response.body.totalPages).toBe(1);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.data).toEqual(mockReviews);
      expect(ReviewModel.find).toHaveBeenCalledWith({ recipeId: new Types.ObjectId(mockRecipeId) });
    });

    it('should return 400 if recipeId is not a valid MongoID', async () => {
      const response = await request(app)
        .get('/api/v1/reviews/recipe/invalid-recipe-id');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.some((e:any) => e.msg === "Parameter 'recipeId' must be a valid MongoDB ObjectId.")).toBe(true);
    });

    it('should handle errors during fetching reviews by recipe', async () => {
        (ReviewModel.find as jest.Mock).mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockRejectedValue(new Error('DB error finding reviews by recipe')),
          });
  
        const response = await request(app)
          .get(`/api/v1/reviews/recipe/${mockRecipeId}`);
  
        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('DB error finding reviews by recipe');
      });
  });

  describe('GET /user/:userId', () => {
    it('should return reviews for a given userId with pagination', async () => {
      const mockReviews = [
        { _id: 'review1', recipeId: 'recipe1', userId: mockUserId, rating: 5, comment: 'My review!' },
      ];
      (ReviewModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockReviews),
      });
      (ReviewModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get(`/api/v1/reviews/user/${mockUserId}?page=1&limit=5`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReviews);
      expect(ReviewModel.find).toHaveBeenCalledWith({ userId: new Types.ObjectId(mockUserId) });
    });

     it('should return 400 if userId is not a valid MongoID', async () => {
      const response = await request(app)
        .get('/api/v1/reviews/user/invalid-user-id');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.some((e:any) => e.msg === "Parameter 'userId' must be a valid MongoDB ObjectId.")).toBe(true);
    });
  });

  describe('GET /:id', () => {
    it('should return a single review by its ID', async () => {
      const reviewId = new Types.ObjectId().toHexString();
      const mockReview = { _id: reviewId, recipeId: mockRecipeId, userId: mockUserId, rating: 5 };
      (ReviewModel.findById as jest.Mock).mockResolvedValue(mockReview);

      const response = await request(app)
        .get(`/api/v1/reviews/${reviewId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReview);
      expect(ReviewModel.findById).toHaveBeenCalledWith(reviewId);
    });

    it('should return 404 if review not found by ID', async () => {
      const reviewId = new Types.ObjectId().toHexString();
      (ReviewModel.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/v1/reviews/${reviewId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Review not found.');
    });

    it('should return 400 if id is not a valid MongoID', async () => {
        const response = await request(app)
          .get('/api/v1/reviews/invalid-id');
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors.some((e:any) => e.msg === "Parameter 'id' must be a valid MongoDB ObjectId.")).toBe(true);
      });
  });

  describe('PUT /:id', () => {
    const reviewId = new Types.ObjectId().toHexString();
    const updateData = { rating: 4, comment: 'Updated comment' };

    it('should update a review if user is owner', async () => {
      const mockReview = {
        _id: reviewId,
        recipeId: mockRecipeId,
        userId: mockUserId, // Owner
        rating: 3,
        comment: 'Old comment',
        save: jest.fn().mockResolvedValue({ ...updateData, _id: reviewId, userId: mockUserId }),
      };
      (ReviewModel.findById as jest.Mock).mockResolvedValue(mockReview);

      const response = await request(app)
        .put(`/api/v1/reviews/${reviewId}`)
        .set('x-user-id', mockUserId) // Authenticated as owner
        .set('x-user-roles', 'user')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(updateData.rating);
      expect(response.body.data.comment).toBe(updateData.comment);
      expect(mockReview.save).toHaveBeenCalled();
    });

    it('should return 403 if user is not owner', async () => {
      const anotherUserId = new Types.ObjectId().toHexString();
      const mockReview = {
        _id: reviewId,
        recipeId: mockRecipeId,
        userId: mockUserId, // Belongs to mockUserId
        rating: 3,
        save: jest.fn(),
      };
      (ReviewModel.findById as jest.Mock).mockResolvedValue(mockReview);

      const response = await request(app)
        .put(`/api/v1/reviews/${reviewId}`)
        .set('x-user-id', anotherUserId) // Authenticated as someone else
        .set('x-user-roles', 'user')
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to update this review.');
    });

    it('should return 404 if review to update not found', async () => {
      (ReviewModel.findById as jest.Mock).mockResolvedValue(null);
      const response = await request(app)
        .put(`/api/v1/reviews/${reviewId}`)
        .set('x-user-id', mockUserId)
        .set('x-user-roles', 'user')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Review not found.');
    });
    
    it('should return 400 if id is not a valid MongoID', async () => {
        const response = await request(app)
          .put('/api/v1/reviews/invalid-id')
          .set('x-user-id', mockUserId).set('x-user-roles', 'user')
          .send(updateData);
        
        expect(response.status).toBe(400);
        expect(response.body.errors.some((e:any) => e.msg === "Parameter 'id' must be a valid MongoDB ObjectId.")).toBe(true);
    });

    it('should return 400 if no fields to update are provided', async () => {
        const response = await request(app)
          .put(`/api/v1/reviews/${reviewId}`)
          .set('x-user-id', mockUserId).set('x-user-roles', 'user')
          .send({}); // Empty body
        
        expect(response.status).toBe(400);
        expect(response.body.errors.some((e:any) => e.msg === 'At least one field (rating or comment) must be provided for update.')).toBe(true);
    });
  });

  describe('DELETE /:id', () => {
    const reviewId = new Types.ObjectId().toHexString();

    it('should delete a review if user is owner', async () => {
      const mockReview = { _id: reviewId, userId: mockUserId }; // Owner
      (ReviewModel.findById as jest.Mock).mockResolvedValue(mockReview);
      (ReviewModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockReview); // Simulate successful delete

      const response = await request(app)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('x-user-id', mockUserId) // Authenticated as owner
        .set('x-user-roles', 'user');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Review deleted successfully');
      expect(ReviewModel.findByIdAndDelete).toHaveBeenCalledWith(reviewId);
    });

    it('should delete a review if user is admin', async () => {
      const anotherUserId = new Types.ObjectId().toHexString();
      const mockReview = { _id: reviewId, userId: anotherUserId }; // Belongs to someone else
      (ReviewModel.findById as jest.Mock).mockResolvedValue(mockReview);
      (ReviewModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockReview);

      const response = await request(app)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('x-user-id', mockUserId) // Authenticated as an admin
        .set('x-user-roles', 'admin');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(ReviewModel.findByIdAndDelete).toHaveBeenCalledWith(reviewId);
    });

    it('should return 403 if user is not owner and not admin', async () => {
      const anotherUserId = new Types.ObjectId().toHexString(); // Some other user
      const yetAnotherUserId = new Types.ObjectId().toHexString(); // User trying to delete
      const mockReview = { _id: reviewId, userId: anotherUserId }; 
      (ReviewModel.findById as jest.Mock).mockResolvedValue(mockReview);

      const response = await request(app)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('x-user-id', yetAnotherUserId) // Authenticated as non-owner, non-admin
        .set('x-user-roles', 'user');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to delete this review.');
    });

    it('should return 404 if review to delete not found', async () => {
      (ReviewModel.findById as jest.Mock).mockResolvedValue(null);
      const response = await request(app)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('x-user-id', mockUserId)
        .set('x-user-roles', 'user');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Review not found.');
    });

    it('should return 401 if user is not authenticated for delete', async () => {
        const response = await request(app)
          .delete(`/api/v1/reviews/${reviewId}`);
  
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Mock protect: User ID missing or invalid');
      });

      it('should return 400 if id is not a valid MongoID for delete', async () => {
        const response = await request(app)
          .delete('/api/v1/reviews/invalid-id')
          .set('x-user-id', mockUserId).set('x-user-roles', 'user');
        
        expect(response.status).toBe(400);
        expect(response.body.errors.some((e:any) => e.msg === "Parameter 'id' must be a valid MongoDB ObjectId.")).toBe(true);
    });
  });
}); 