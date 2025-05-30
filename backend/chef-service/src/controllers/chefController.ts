import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { Chef, IChef } from '../models/Chef';
import { AuthError, IAuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

// Helper function to check if a string is a valid ObjectId
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// PUBLIC ENDPOINTS

// @desc    Get chef profile by ID or Clerk ID
// @route   GET /api/v1/chefs/:id
// @access  Public
export const getChefProfileById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    let chef;

    // Try to find by MongoDB ObjectId first, then by Clerk ID if not a valid ObjectId
    if (isValidObjectId(id)) {
        chef = await Chef.findById(id).where({ isActive: true, accountStatus: 'active' });
    } else {
        // If not a valid ObjectId, assume it's a Clerk ID
        chef = await Chef.findOne({ clerkId: id, isActive: true, accountStatus: 'active' });
    }

    if (!chef) {
        throw new AuthError(`Chef not found with identifier: ${id}`, 404);
    }
    res.status(200).json({ success: true, data: chef });
});

// @desc    Get popular chefs (e.g., by followers or ratings - simplistic for now)
// @route   GET /api/v1/chefs/popular
// @access  Public
export const getPopularChefs = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const popularChefs = await Chef.find({ isActive: true, accountStatus: 'active', isVerified: true })
        .sort({ 'statistics.totalFollowers': -1, 'statistics.averageRating': -1 })
        .limit(limit)
        .select('name avatar specialization statistics.averageRating statistics.totalFollowers region'); 

    res.status(200).json({ success: true, count: popularChefs.length, data: popularChefs });
});

// @desc    Search chefs by name, specialization, region, tribe
// @route   GET /api/v1/chefs/search
// @access  Public
export const searchChefs = asyncHandler(async (req: Request, res: Response) => {
    const { q, region, tribe, specialization: specQuery, page = 1, limit = 10 } = req.query;
    const query: any = { isActive: true, accountStatus: 'active', isVerified: true };

    if (q) {
        query.$text = { $search: q as string };
    }
    if (region) {
        query.region = region as string;
    }
    if (tribe) {
        query.tribe = tribe as string;
    }
    if (specQuery) {
        query.specialization = { $in: (specQuery as string).split(',').map(s => s.trim()) };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const chefs = await Chef.find(query)
        .sort(q ? { score: { $meta: 'textScore' } } : { 'statistics.totalFollowers': -1 })
        .skip(skip)
        .limit(limitNum)
        .select('name avatar specialization statistics.averageRating statistics.totalFollowers region');

    const totalChefs = await Chef.countDocuments(query);

    res.status(200).json({
        success: true,
        count: chefs.length,
        totalPages: Math.ceil(totalChefs / limitNum),
        currentPage: pageNum,
        data: chefs,
    });
});

// @desc    Get recipes by chef (Placeholder - Recipe data is in RecipeService)
// @route   GET /api/v1/chefs/:chefId/recipes
// @access  Public
export const getChefRecipes = asyncHandler(async (req: Request, res: Response) => {
    const { chefId } = req.params;
    // 1. Validate chefId exists
    const chef = await Chef.findOne(isValidObjectId(chefId) ? { _id: chefId } : { clerkId: chefId })
                            .where({ isActive: true, accountStatus: 'active' });
    if (!chef) {
        throw new AuthError(`Chef not found with identifier: ${chefId}`, 404);
    }
    // 2. Call RecipeService to get recipes for this chef.chefId (ObjectId)
    res.status(200).json({ 
        success: true, 
        message: `This endpoint should return recipes for chef: ${chef.name} (ID: ${chef._id}). Integration with RecipeService is needed.` 
    });
});

// @desc    Get chef followers (Placeholder - User data is in UserService)
// @route   GET /api/v1/chefs/:chefId/followers
// @access  Public
export const getChefFollowers = asyncHandler(async (req: Request, res: Response) => {
    const { chefId } = req.params;
    const chef = await Chef.findOne(isValidObjectId(chefId) ? { _id: chefId } : { clerkId: chefId })
                            .where({ isActive: true, accountStatus: 'active' })
                            .populate('followers', 'username avatar'); // Assuming User model has username and avatar

    if (!chef) {
        throw new AuthError(`Chef not found with identifier: ${chefId}`, 404);
    }
    // This will return follower details if UserService is separate and User model is not directly queryable here.
    // A call to UserService might be needed to get full follower profiles based on IDs in chef.followers
    res.status(200).json({ success: true, count: chef.followers.length, data: chef.followers });
});


// CHEF-ONLY ENDPOINTS (Authenticated Chef)

// @desc    Update own chef profile
// @route   PUT /api/v1/chefs/profile
// @access  Private (Chef only)
export const updateChefProfile = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const chefId = req.user!.id; // Clerk ID from auth middleware
    const updates = req.body;

    // Fields a chef can update (excluding sensitive fields like verificationStatus, isVerified, followers, statistics etc.)
    const allowedUpdates: (keyof IChef)[] = ['name', 'bio', 'avatar', 'specialization', 'experience', 'region', 'tribe', 'socialMedia'];
    const filteredUpdates: Partial<IChef> = {};

    for (const key of Object.keys(updates)) {
        if (allowedUpdates.includes(key as keyof IChef)) {
            (filteredUpdates as any)[key] = updates[key];
        }
    }

    // Cannot update email or clerkId via this route
    if (filteredUpdates.email || filteredUpdates.clerkId) {
        throw new AuthError('Cannot update email or clerkId via this route', 400);
    }

    const chef = await Chef.findOneAndUpdate(
        { clerkId: chefId, accountStatus: 'active' }, 
        { $set: filteredUpdates }, 
        { new: true, runValidators: true }
    );

    if (!chef) {
        throw new AuthError('Chef profile not found or not active', 404);
    }
    res.status(200).json({ success: true, data: chef });
});

// @desc    Get own chef statistics
// @route   GET /api/v1/chefs/statistics
// @access  Private (Chef only)
export const getChefStatistics = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const chefId = req.user!.id; // Clerk ID
    const chef = await Chef.findOne({ clerkId: chefId, accountStatus: 'active' }).select('statistics name');
    if (!chef) {
        throw new AuthError('Chef profile not found or not active', 404);
    }
    res.status(200).json({ success: true, data: chef.statistics || {} });
});

// @desc    Apply for chef verification
// @route   POST /api/v1/chefs/apply-verification
// @access  Private (Chef only)
export const applyForVerification = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const chefId = req.user!.id; // Clerk ID
    const { verificationDocuments } = req.body; // Expecting an array of document URLs/identifiers

    if (!verificationDocuments || !Array.isArray(verificationDocuments) || verificationDocuments.length === 0) {
        throw new AuthError('Verification documents are required as an array of strings.', 400);
    }

    const chef = await Chef.findOne({ clerkId: chefId, accountStatus: 'active' });
    if (!chef) {
        throw new AuthError('Chef profile not found or not active', 404);
    }

    if (chef.verificationStatus === 'verified' || chef.verificationStatus === 'pending') {
        throw new AuthError(`Cannot apply for verification. Current status: ${chef.verificationStatus}`, 400);
    }

    chef.verificationStatus = 'pending';
    chef.verificationDocuments = verificationDocuments;
    chef.isVerified = false; // Reset in case it was rejected before
    chef.verificationNotes = undefined; // Clear previous notes
    await chef.save();

    res.status(200).json({ success: true, message: 'Verification application submitted successfully.', data: chef });
});

// @desc    Upload/Update verification documents
// @route   PUT /api/v1/chefs/verification-documents
// @access  Private (Chef only)
export const uploadVerificationDocuments = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const chefId = req.user!.id; // Clerk ID
    const { verificationDocuments } = req.body;

    if (!verificationDocuments || !Array.isArray(verificationDocuments) || verificationDocuments.length === 0) {
        throw new AuthError('Verification documents are required as an array of strings.', 400);
    }

    const chef = await Chef.findOne({ clerkId: chefId, accountStatus: 'active' });
    if (!chef) {
        throw new AuthError('Chef profile not found or not active', 404);
    }

    // Allow updating documents if status is pending or rejected
    if (chef.verificationStatus === 'verified') {
        throw new AuthError('Cannot update documents for an already verified chef.', 400);
    }

    chef.verificationDocuments = verificationDocuments;
    if (chef.verificationStatus === 'rejected') { // If re-uploading after rejection, move to pending
        chef.verificationStatus = 'pending';
        chef.verificationNotes = undefined; 
    }
    await chef.save();
    res.status(200).json({ success: true, message: 'Verification documents updated.', data: chef });
});


// USER-ONLY ENDPOINTS (Authenticated User)

// @desc    Follow a chef
// @route   POST /api/v1/chefs/:chefIdToFollow/follow
// @access  Private (User only)
export const followChef = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user!.id); // User performing the follow (this is Clerk ID from header, should be User _id if User service is linked)
    const { chefIdToFollow } = req.params; // This can be Chef's ObjectId or ClerkId

    let chefToFollowQuery;
    if (isValidObjectId(chefIdToFollow)) {
        chefToFollowQuery = { _id: new mongoose.Types.ObjectId(chefIdToFollow) };
    } else {
        chefToFollowQuery = { clerkId: chefIdToFollow };
    }

    const chef = await Chef.findOne(chefToFollowQuery).where({ isActive: true, accountStatus: 'active' });

    if (!chef) {
        throw new AuthError(`Chef to follow not found with identifier: ${chefIdToFollow}`, 404);
    }
    
    // Prevent self-follow if the user is also a chef (using Clerk ID for comparison)
    if (chef.clerkId === req.user!.id) {
        throw new AuthError('You cannot follow yourself.', 400);
    }

    // Add follower if not already present and update count
    // Note: `userId` here is the Clerk ID. If your User service uses Mongo ObjectIds, you'd need to map this.
    // For simplicity here, we'll assume followers array stores Clerk IDs as strings if no User service link yet.
    // However, the schema defines followers as Types.ObjectId[]. This implies a linked User collection.
    // This part needs alignment with how UserService and RecipeService store user/chef IDs (ClerkID vs ObjectId)
    // For now, we assume req.user.id is a string that needs to be converted to ObjectId if storing refs.
    // If your User model's _id is DIFFERENT from clerkId, this logic needs adjustment.

    // For this example, let's assume we need to fetch the User's ObjectId based on req.user.id (ClerkID)
    // This would typically be a call to UserService. For now, we'll use the req.user.id directly as if it were the User's ObjectId.
    // This is a simplification and needs proper handling in a real multi-service setup.

    const alreadyFollowing = chef.followers.some(followerId => followerId.equals(userId));

    if (alreadyFollowing) {
        return res.status(200).json({ success: true, message: 'Already following this chef.', data: chef });
    }

    chef.followers.push(userId as any); // Cast to any if storing Clerk IDs directly and schema expects ObjectId
    chef.statistics!.totalFollowers = (chef.statistics!.totalFollowers || 0) + 1;
    await chef.save();

    // TODO: Notify Chef (NotificationService)
    res.status(200).json({ success: true, message: `Successfully followed ${chef.name}.`, data: chef });
});

// @desc    Unfollow a chef
// @route   DELETE /api/v1/chefs/:chefIdToUnfollow/unfollow
// @access  Private (User only)
export const unfollowChef = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user!.id); // User performing the unfollow
    const { chefIdToUnfollow } = req.params;

    let chefToUnfollowQuery;
    if (isValidObjectId(chefIdToUnfollow)) {
        chefToUnfollowQuery = { _id: new mongoose.Types.ObjectId(chefIdToUnfollow) };
    } else {
        chefToUnfollowQuery = { clerkId: chefIdToUnfollow };
    }

    const chef = await Chef.findOne(chefToUnfollowQuery).where({ isActive: true, accountStatus: 'active' });

    if (!chef) {
        throw new AuthError(`Chef to unfollow not found with identifier: ${chefIdToUnfollow}`, 404);
    }

    const followerIndex = chef.followers.findIndex(followerId => followerId.equals(userId));

    if (followerIndex === -1) {
        return res.status(200).json({ success: true, message: 'You are not following this chef.', data: chef });
    }

    chef.followers.splice(followerIndex, 1);
    chef.statistics!.totalFollowers = Math.max(0, (chef.statistics!.totalFollowers || 0) - 1);
    await chef.save();

    res.status(200).json({ success: true, message: `Successfully unfollowed ${chef.name}.`, data: chef });
});

// @desc    Get list of chefs the current user is following
// @route   GET /api/v1/chefs/following
// @access  Private (User only)
export const getFollowedChefs = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user!.id); // User ID

    // Find chefs where the current user's ID is in their followers list
    const followedChefs = await Chef.find({ 
        followers: userId, 
        isActive: true, 
        accountStatus: 'active' 
    }).select('name avatar specialization region');

    res.status(200).json({ success: true, count: followedChefs.length, data: followedChefs });
});


// ADMIN-ONLY ENDPOINTS

// @desc    Get all chefs (with filters for admin)
// @route   GET /api/v1/admin/chefs/all
// @access  Private (Admin only)
export const getAllChefs = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, verificationStatus, accountStatus, region, isVerified } = req.query;
    const query: any = {};

    if (verificationStatus) query.verificationStatus = verificationStatus as string;
    if (accountStatus) query.accountStatus = accountStatus as string;
    if (region) query.region = region as string;
    if (typeof isVerified === 'string') query.isVerified = isVerified === 'true';
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const chefs = await Chef.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
    const totalChefs = await Chef.countDocuments(query);

    res.status(200).json({
        success: true,
        count: chefs.length,
        totalPages: Math.ceil(totalChefs / limitNum),
        currentPage: pageNum,
        data: chefs,
    });
});

// @desc    Get pending chef verification requests
// @route   GET /api/v1/admin/chefs/pending-verification
// @access  Private (Admin only)
export const getPendingVerifications = asyncHandler(async (req: Request, res: Response) => {
    const chefs = await Chef.find({ verificationStatus: 'pending', isActive: true })
        .select('name email region verificationDocuments createdAt');
    res.status(200).json({ success: true, count: chefs.length, data: chefs });
});

// @desc    Verify a chef
// @route   PUT /api/v1/admin/chefs/:chefId/verify
// @access  Private (Admin only)
export const verifyChef = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const adminId = new mongoose.Types.ObjectId(req.user!.id); // Admin performing action
    const { chefId } = req.params; // Chef's ObjectId

    if (!isValidObjectId(chefId)) {
        throw new AuthError('Invalid Chef ID format', 400);
    }

    const chef = await Chef.findById(chefId);
    if (!chef) {
        throw new AuthError(`Chef not found with ID: ${chefId}`, 404);
    }

    if (chef.verificationStatus === 'verified') {
        throw new AuthError('Chef is already verified.', 400);
    }

    chef.verificationStatus = 'verified';
    chef.isVerified = true;
    chef.verifiedAt = new Date();
    chef.verifiedBy = adminId;
    chef.verificationNotes = req.body.verificationNotes || 'Chef verified by admin.'; // Optional notes from admin
    await chef.save();

    // TODO: Notify Chef (NotificationService)
    res.status(200).json({ success: true, message: `Chef ${chef.name} has been verified.`, data: chef });
});

// @desc    Reject a chef verification
// @route   PUT /api/v1/admin/chefs/:chefId/reject-verification
// @access  Private (Admin only)
export const rejectChefVerification = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const adminId = new mongoose.Types.ObjectId(req.user!.id);
    const { chefId } = req.params;
    const { verificationNotes } = req.body;

    if (!isValidObjectId(chefId)) {
        throw new AuthError('Invalid Chef ID format', 400);
    }
    if (!verificationNotes) {
        throw new AuthError('Verification notes are required for rejection.', 400);
    }

    const chef = await Chef.findById(chefId);
    if (!chef) {
        throw new AuthError(`Chef not found with ID: ${chefId}`, 404);
    }

    if (chef.verificationStatus === 'rejected') {
        // Allow updating notes if already rejected
    } else if (chef.verificationStatus === 'verified') {
         throw new AuthError('Cannot reject an already verified chef. Consider suspending or revoking verification through another mechanism.', 400);
    }

    chef.verificationStatus = 'rejected';
    chef.isVerified = false;
    chef.verifiedAt = undefined;
    chef.verifiedBy = adminId; // Admin who rejected
    chef.verificationNotes = verificationNotes;
    await chef.save();

    // TODO: Notify Chef (NotificationService)
    res.status(200).json({ success: true, message: `Chef ${chef.name}'s verification has been rejected.`, data: chef });
}); 