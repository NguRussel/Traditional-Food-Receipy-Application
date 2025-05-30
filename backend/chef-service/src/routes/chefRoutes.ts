import { Router } from 'express';
import {
    getChefProfileById,
    getPopularChefs,
    searchChefs,
    getChefRecipes,
    getChefFollowers,
    updateChefProfile,
    getChefStatistics,
    applyForVerification,
    uploadVerificationDocuments,
    followChef,
    unfollowChef,
    getFollowedChefs
} from '../controllers/chefController';
import { protect } from '../middleware/authMiddleware';
import {
    handleValidationErrors,
    validateMongoIdParam,
    validateUpdateChefProfile,
    validateApplyForVerification,
    validateVerificationDocumentsUpload,
    validateSearchChefsQuery
} from '../middleware/validationMiddleware';

const router = Router();

// PUBLIC ROUTES

/**
 * @openapi
 * /chefs/popular:
 *   get:
 *     summary: Get popular chefs
 *     tags: [Chef - Public]
 *     description: Retrieves a list of popular chefs, sorted by followers and ratings. Verification is required for a chef to appear in this list.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of popular chefs to return.
 *     responses:
 *       200:
 *         description: A list of popular chefs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chef' # Assuming Chef schema is defined
 *       500:
 *         description: Internal server error.
 */
router.get('/popular', getPopularChefs);

/**
 * @openapi
 * /chefs/search:
 *   get:
 *     summary: Search for chefs
 *     tags: [Chef - Public]
 *     description: Searches for verified chefs based on query (name, bio, specialization), region, tribe, and specialization. Results are paginated.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query string for name, bio, or specialization.
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by region.
 *       - in: query
 *         name: tribe
 *         schema:
 *           type: string
 *         description: Filter by tribe.
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Comma-separated list of specializations to filter by.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A list of chefs matching the search criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chef'
 *       400:
 *         description: Invalid query parameters.
 *       500:
 *         description: Internal server error.
 */
router.get('/search', validateSearchChefsQuery, handleValidationErrors, searchChefs);

/**
 * @openapi
 * /chefs/{id}:
 *   get:
 *     summary: Get chef profile by ID
 *     tags: [Chef - Public]
 *     description: Retrieves a specific active chef's profile by their MongoDB ObjectId or Clerk ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId or Clerk ID of the chef.
 *     responses:
 *       200:
 *         description: Chef profile data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Chef'
 *       404:
 *         description: Chef not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id', validateMongoIdParam('id'), handleValidationErrors, getChefProfileById);

/**
 * @openapi
 * /chefs/{chefId}/recipes:
 *   get:
 *     summary: Get recipes by a specific chef
 *     tags: [Chef - Public]
 *     description: Placeholder endpoint. Retrieves a list of recipes by a specific chef. (Requires integration with RecipeService).
 *     parameters:
 *       - in: path
 *         name: chefId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId or Clerk ID of the chef.
 *     responses:
 *       200:
 *         description: A message indicating placeholder status or a list of recipes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: This endpoint should return recipes for chef... Integration with RecipeService is needed.
 *       404:
 *         description: Chef not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:chefId/recipes', validateMongoIdParam('chefId'), handleValidationErrors, getChefRecipes);

/**
 * @openapi
 * /chefs/{chefId}/followers:
 *   get:
 *     summary: Get followers of a specific chef
 *     tags: [Chef - Public]
 *     description: Placeholder endpoint. Retrieves a list of users following a specific chef. (May require integration with UserService for full profiles).
 *     parameters:
 *       - in: path
 *         name: chefId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId or Clerk ID of the chef.
 *     responses:
 *       200:
 *         description: A list of follower IDs or basic follower info.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object # Or a more specific User schema reference if available
 *                     properties:
 *                       _id: 
 *                         type: string
 *                       username: 
 *                         type: string
 *                       avatar:
 *                         type: string
 *       404:
 *         description: Chef not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:chefId/followers', validateMongoIdParam('chefId'), handleValidationErrors, getChefFollowers);

// CHEF-SPECIFIC PROTECTED ROUTES
/**
 * @openapi
 * /chefs/profile:
 *   put:
 *     summary: Update own chef profile
 *     tags: [Chef - Protected]
 *     description: Allows an authenticated chef to update their own profile information. Cannot update email, clerkId, verification status, or statistics directly.
 *     security:
 *       - bearerAuth: [] # Or your actual security scheme if different
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Chef Newname"
 *               bio:
 *                 type: string
 *                 example: "Updated bio with new culinary adventures."
 *               avatar:
 *                 type: string
 *                 format: url
 *                 example: "http://example.com/new_avatar.jpg"
 *               specialization:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Modernist Cuisine", "Sous Vide"]
 *               experience:
 *                 type: integer
 *                 example: 12
 *               region:
 *                 type: string
 *                 example: "Nord-Ouest"
 *               tribe:
 *                 type: string
 *                 example: "Bamileke"
 *               socialMedia:
 *                 $ref: '#/components/schemas/ISocialMedia'
 *     responses:
 *       200:
 *         description: Chef profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Chef'
 *       400:
 *         description: Invalid input data or attempt to update restricted fields.
 *       401:
 *         description: Not authorized, invalid or missing token.
 *       403:
 *         description: Forbidden, user is not a chef or trying to access other's profile.
 *       404:
 *         description: Chef profile not found or not active.
 *       500:
 *         description: Internal server error.
 */
router.put('/profile', 
    protect, 
    validateUpdateChefProfile, 
    handleValidationErrors, 
    updateChefProfile
);

/**
 * @openapi
 * /chefs/statistics:
 *   get:
 *     summary: Get own chef statistics
 *     tags: [Chef - Protected]
 *     description: Retrieves statistics for the authenticated chef (e.g., total recipes, views, followers).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chef statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/IChefStatistics'
 *       401:
 *         description: Not authorized, invalid or missing token.
 *       403:
 *         description: Forbidden, user is not a chef.
 *       404:
 *         description: Chef profile not found or not active.
 *       500:
 *         description: Internal server error.
 */
router.get('/statistics', protect, getChefStatistics);

/**
 * @openapi
 * /chefs/apply-verification:
 *   post:
 *     summary: Apply for chef verification
 *     tags: [Chef - Protected]
 *     description: Allows an authenticated chef to submit an application for verification, providing necessary documents.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verificationDocuments
 *             properties:
 *               verificationDocuments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: url
 *                 description: Array of URLs or identifiers for verification documents.
 *                 example: ["http://example.com/id_card.pdf", "http://example.com/certificate.pdf"]
 *     responses:
 *       200:
 *         description: Verification application submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Chef' # Shows updated chef status
 *       400:
 *         description: Invalid input, documents missing, or already verified/pending.
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden, user is not a chef.
 *       404:
 *         description: Chef profile not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/apply-verification', 
    protect, 
    validateApplyForVerification, 
    handleValidationErrors, 
    applyForVerification
);

/**
 * @openapi
 * /chefs/verification-documents:
 *   put:
 *     summary: Upload/Update verification documents
 *     tags: [Chef - Protected]
 *     description: Allows an authenticated chef to upload or update their verification documents if their status is pending or rejected.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verificationDocuments
 *             properties:
 *               verificationDocuments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: url
 *                 description: Array of URLs or identifiers for verification documents.
 *                 example: ["http://example.com/updated_id_card.pdf"]
 *     responses:
 *       200:
 *         description: Verification documents updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Chef'
 *       400:
 *         description: Invalid input, documents missing, or chef is already verified.
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden, user is not a chef.
 *       404:
 *         description: Chef profile not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/verification-documents', 
    protect, 
    validateVerificationDocumentsUpload, 
    handleValidationErrors, 
    uploadVerificationDocuments
);

// USER-SPECIFIC PROTECTED ROUTES
/**
 * @openapi
 * /chefs/{chefIdToFollow}/follow:
 *   post:
 *     summary: Follow a chef
 *     tags: [User - Protected, Chef - User Interactions]
 *     description: Allows an authenticated user to follow a specific chef. The `chefIdToFollow` can be the chef's MongoDB ObjectId or their Clerk ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chefIdToFollow
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId or Clerk ID of the chef to follow.
 *     responses:
 *       200:
 *         description: Successfully followed the chef or already following.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Chef' # Chef object with updated follower count
 *       400:
 *         description: Cannot follow self, or invalid input.
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden (e.g., user role not permitted, though typically `protect` handles basic auth).
 *       404:
 *         description: Chef to follow not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/:chefIdToFollow/follow', 
    protect, 
    validateMongoIdParam('chefIdToFollow'), 
    handleValidationErrors, 
    followChef
);

/**
 * @openapi
 * /chefs/{chefIdToUnfollow}/unfollow:
 *   delete:
 *     summary: Unfollow a chef
 *     tags: [User - Protected, Chef - User Interactions]
 *     description: Allows an authenticated user to unfollow a specific chef. The `chefIdToUnfollow` can be the chef's MongoDB ObjectId or their Clerk ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chefIdToUnfollow
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId or Clerk ID of the chef to unfollow.
 *     responses:
 *       200:
 *         description: Successfully unfollowed the chef or was not following.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Chef' # Chef object with updated follower count
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Chef to unfollow not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:chefIdToUnfollow/unfollow', 
    protect, 
    validateMongoIdParam('chefIdToUnfollow'), 
    handleValidationErrors, 
    unfollowChef
);

/**
 * @openapi
 * /chefs/following:
 *   get:
 *     summary: Get list of chefs current user is following
 *     tags: [User - Protected, Chef - User Interactions]
 *     description: Retrieves a list of chefs that the currently authenticated user is following.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of followed chefs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chef' # Or a summarized version
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get('/following', protect, getFollowedChefs);

export default router; 