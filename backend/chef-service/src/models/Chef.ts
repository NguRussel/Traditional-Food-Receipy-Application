import { Schema, model, Document, Types } from 'mongoose';

// Interface for SocialMedia
/**
 * @openapi
 * components:
 *   schemas:
 *     ISocialMedia:
 *       type: object
 *       properties:
 *         instagram: 
 *           type: string
 *           description: Instagram profile URL.
 *           example: https://instagram.com/chef_example
 *         facebook:
 *           type: string
 *           description: Facebook profile URL.
 *           example: https://facebook.com/chef_example
 *         youtube:
 *           type: string
 *           description: YouTube channel URL.
 *           example: https://youtube.com/chef_example
 */
export interface ISocialMedia {
    instagram?: string;
    facebook?: string;
    youtube?: string;
}

// Schema for SocialMedia
const SocialMediaSchema = new Schema<ISocialMedia>({
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },
    youtube: { type: String, trim: true },
}, { _id: false });

// Interface for ChefStatistics
/**
 * @openapi
 * components:
 *   schemas:
 *     IChefStatistics:
 *       type: object
 *       properties:
 *         totalRecipes:
 *           type: integer
 *           default: 0
 *           description: Total number of recipes created by the chef.
 *         totalViews:
 *           type: integer
 *           default: 0
 *           description: Total views across all chef's recipes or profile.
 *         totalFollowers:
 *           type: integer
 *           default: 0
 *           description: Total number of followers.
 *         averageRating:
 *           type: number
 *           format: float
 *           default: 0
 *           minimum: 0
 *           maximum: 5
 *           description: Average rating of the chef or their recipes.
 *         totalReviews:
 *           type: integer
 *           default: 0
 *           description: Total number of reviews received.
 */
export interface IChefStatistics {
    totalRecipes: number;
    totalViews: number;
    totalFollowers: number;
    averageRating: number;
    totalReviews: number;
}

// Schema for ChefStatistics
const ChefStatisticsSchema = new Schema<IChefStatistics>({
    totalRecipes: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalFollowers: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
}, { _id: false });

// Interface for Chef document
/**
 * @openapi
 * components:
 *   schemas:
 *     Chef:
 *       type: object
 *       required:
 *         - clerkId
 *         - email
 *         - name
 *         - bio
 *         - experience
 *         - region
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated MongoDB ObjectId of the chef.
 *           example: 60d0fe4f5311236168a109cb
 *         clerkId:
 *           type: string
 *           description: Clerk user ID for authentication and linking.
 *           unique: true
 *           example: user_2L4h3Jk9s8Gq7P6R1F0E
 *         email:
 *           type: string
 *           format: email
 *           description: Chef's email address.
 *           unique: true
 *           example: chef.ramsay@example.com
 *         name:
 *           type: string
 *           description: Chef's full name.
 *           example: Gordon Ramsay
 *         bio:
 *           type: string
 *           description: A short biography of the chef.
 *           example: World-renowned chef, restaurateur, and television personality.
 *         avatar:
 *           type: string
 *           format: url
 *           description: URL to the chef's avatar image.
 *           example: http://example.com/avatar.jpg
 *         specialization:
 *           type: array
 *           items:
 *             type: string
 *           description: List of culinary specializations.
 *           example: ["French Cuisine", "Pastry"]
 *         experience:
 *           type: integer
 *           description: Years of culinary experience.
 *           minimum: 0
 *           example: 25
 *         region:
 *           type: string
 *           description: Cameroonian region the chef is associated with.
 *           example: "Littoral"
 *         tribe:
 *           type: string
 *           description: Chef's tribe, if applicable.
 *           example: "Douala"
 *         verificationStatus:
 *           type: string
 *           enum: [pending, verified, rejected]
 *           default: pending
 *           description: Status of the chef's verification application.
 *         verificationDocuments:
 *           type: array
 *           items:
 *             type: string
 *             format: url
 *           description: URLs to documents submitted for verification.
 *           example: ["http://example.com/doc1.pdf"]
 *         verificationNotes:
 *           type: string
 *           description: Notes from admin regarding verification status.
 *         isVerified:
 *           type: boolean
 *           default: false
 *           description: Whether the chef is verified by an admin.
 *         socialMedia:
 *           $ref: '#/components/schemas/ISocialMedia'
 *         statistics:
 *           $ref: '#/components/schemas/IChefStatistics'
 *         followers:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *             description: Array of User ObjectIds who follow this chef.
 *           example: ["60d0fe4f5311236168a109cc", "60d0fe4f5311236168a109cd"]
 *         accountStatus:
 *           type: string
 *           enum: [active, suspended, banned]
 *           default: active
 *           description: Current status of the chef's account.
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the chef's profile is publicly active.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the chef profile was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the chef profile was last updated.
 *         verifiedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the chef was verified.
 *         verifiedBy:
 *           type: string
 *           format: ObjectId
 *           description: ObjectId of the Admin who verified the chef.
 */
export interface IChef extends Document {
    clerkId: string;
    email: string;
    name: string;
    bio: string;
    avatar?: string;
    specialization: string[];
    experience: number; // years
    region: string;
    tribe?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verificationDocuments: string[];
    verificationNotes?: string;
    isVerified: boolean;
    socialMedia?: ISocialMedia;
    statistics?: IChefStatistics;
    followers: Types.ObjectId[]; // User IDs
    accountStatus: 'active' | 'suspended' | 'banned';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    verifiedAt?: Date;
    verifiedBy?: Types.ObjectId; // Admin ID
}

// Schema for Chef
const ChefSchema = new Schema<IChef>(
    {
        clerkId: { type: String, required: true, unique: true, trim: true, index: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
        name: { type: String, required: true, trim: true, index: true },
        bio: { type: String, required: true, trim: true },
        avatar: { type: String, trim: true }, // URL to avatar image
        specialization: [{ type: String, trim: true }],
        experience: { type: Number, required: true, min: 0 },
        region: { type: String, required: true, trim: true, index: true }, // e.g., 'Centre', 'Littoral'
        tribe: { type: String, trim: true, index: true },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending',
            index: true,
        },
        verificationDocuments: [{ type: String, trim: true }], // URLs to documents
        verificationNotes: { type: String, trim: true },
        isVerified: { type: Boolean, default: false, index: true },
        socialMedia: SocialMediaSchema,
        statistics: ChefStatisticsSchema,
        followers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Assuming a User model exists elsewhere
        accountStatus: {
            type: String,
            enum: ['active', 'suspended', 'banned'],
            default: 'active',
            index: true,
        },
        isActive: { type: Boolean, default: true, index: true },
        verifiedAt: { type: Date },
        verifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin' }, // Assuming an Admin model exists elsewhere
    },
    { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Text index for searching by name and bio
ChefSchema.index({ name: 'text', bio: 'text', specialization: 'text' });

// Ensure default empty objects for socialMedia and statistics if not provided
ChefSchema.pre('save', function (next) {
    if (this.isNew || !this.socialMedia) {
        this.socialMedia = {};
    }
    if (this.isNew || !this.statistics) {
        this.statistics = { totalRecipes: 0, totalViews: 0, totalFollowers: 0, averageRating: 0, totalReviews: 0 };
    }
    next();
});

export const Chef = model<IChef>('Chef', ChefSchema); 