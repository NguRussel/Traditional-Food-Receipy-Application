import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     Ingredient:
 *       type: object
 *       required:
 *         - name
 *         - quantity
 *         - unit
 *       properties:
 *         _id: 
 *           type: string
 *           description: The auto-generated id of the ingredient (within a recipe)
 *           readOnly: true
 *         name:
 *           type: string
 *           description: Name of the ingredient
 *           example: Palm Oil
 *         quantity:
 *           type: string
 *           description: Quantity of the ingredient (e.g., '2', '1/2')
 *           example: '2'
 *         unit:
 *           type: string
 *           description: Unit for the quantity (e.g., 'cups', 'tbsp', 'kg')
 *           example: cups
 *         isOptional:
 *           type: boolean
 *           description: Whether the ingredient is optional
 *           default: false
 */
export interface IIngredient extends Document {
  name: string;
  quantity: string;
  unit: string;
  isOptional: boolean;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - chefId
 *         - chefName
 *         - cookingTime
 *         - difficulty
 *         - servings
 *         - ingredients
 *         - instructions
 *         - tags
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the recipe
 *           readOnly: true
 *         name:
 *           type: string
 *           description: Name of the recipe
 *           example: Ndole
 *         description:
 *           type: string
 *           description: A brief description of the recipe
 *           example: A delicious Cameroonian dish made with bitterleaf and peanuts.
 *         chefId:
 *           type: string
 *           description: ID of the chef who created the recipe
 *           example: 60d5ec49f739d4001c9d8182
 *         chefName:
 *           type: string
 *           description: Name of the chef (denormalized)
 *           example: Mama Philo
 *         cookingTime:
 *           type: integer
 *           format: int32
 *           description: Cooking time in minutes
 *           example: 90
 *         difficulty:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *           description: Difficulty level of the recipe
 *           example: Medium
 *         servings:
 *           type: integer
 *           format: int32
 *           description: Number of servings the recipe makes
 *           example: 4
 *         ingredients:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Ingredient'
 *         instructions:
 *           type: array
 *           items:
 *             type: string
 *           description: Steps to prepare the recipe
 *           example: ["Wash the bitterleaf thoroughly.", "Boil the meat until tender."]
 *         tags:
 *           type: object
 *           properties:
 *             ingredients:
 *               type: array
 *               items:
 *                 type: string
 *               description: Keyword ingredients for searching/tagging
 *               example: ["bitterleaf", "peanuts", "beef"]
 *             categories:
 *               type: array
 *               items:
 *                 type: string
 *               description: Recipe categories (e.g., main course, soup)
 *               example: ["main course", "traditional"]
 *             timeOfDay:
 *               type: array
 *               items:
 *                 type: string
 *               description: Suitable time of day for the recipe
 *               example: ["lunch", "dinner"]
 *             region:
 *               type: string
 *               description: Cameroonian region associated with the recipe
 *               example: Littoral
 *             tribe:
 *               type: string
 *               description: Tribe associated with the recipe
 *               example: Douala
 *             holidays:
 *               type: array
 *               items:
 *                 type: string
 *               description: Holidays the recipe is suitable for
 *               example: ["Christmas"]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: url
 *           description: URLs of images for the recipe
 *           example: ["http://example.com/ndole1.jpg"]
 *         videoUrl:
 *           type: string
 *           format: url
 *           description: URL of a video for the recipe
 *           example: http://example.com/ndole_video.mp4
 *         ratings:
 *           type: object
 *           properties:
 *             average:
 *               type: number
 *               format: float
 *               description: Average rating (1-5)
 *               default: 0
 *             count:
 *               type: integer
 *               format: int32
 *               description: Number of ratings received
 *               default: 0
 *           readOnly: true 
 *         views:
 *           type: integer
 *           format: int32
 *           description: Number of times the recipe has been viewed
 *           default: 0
 *           readOnly: true
 *         nutritionInfo:
 *           type: object
 *           description: Nutritional information (flexible structure for now)
 *           example: { calories: 500, protein: "30g" }
 *         status:
 *           type: string
 *           enum: [draft, pending, approved, rejected]
 *           description: Approval status of the recipe
 *           default: draft
 *         moderationNotes:
 *           type: string
 *           description: Notes from admin regarding moderation/rejection
 *         isActive:
 *           type: boolean
 *           description: Whether the recipe is currently active/visible
 *           default: true
 *         approvedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the recipe was approved
 *           readOnly: true
 *         approvedBy:
 *           type: string
 *           description: ID of the admin who approved the recipe
 *           readOnly: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the recipe was created
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the recipe was last updated
 *           readOnly: true
 */
export interface IRecipe extends Document {
  name: string;
  description: string;
  chefId: Types.ObjectId;
  chefName: string;
  cookingTime: number; // minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  ingredients: IIngredient[];
  instructions: string[];
  tags: {
    ingredients: string[];
    categories: string[];
    timeOfDay: string[];
    region: string;
    tribe: string;
    holidays: string[];
  };
  images: string[]; // Firebase Storage URLs
  videoUrl?: string; // Firebase Storage URL
  ratings: {
    average: number;
    count: number;
  };
  views?: number;
  nutritionInfo?: any; // Placeholder for NutritionInfo, to be defined later if needed
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
  isActive: boolean;
  approvedAt?: Date;
  approvedBy?: Types.ObjectId; // Admin ID
  // createdAt and updatedAt are automatically added by timestamps: true
}

const IngredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  unit: { type: String, required: true },
  isOptional: { type: Boolean, default: false },
});

const RecipeSchema = new Schema<IRecipe>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    chefId: { type: Schema.Types.ObjectId, ref: 'Chef', required: true }, // Assuming a Chef model
    chefName: { type: String, required: true }, // Denormalized for easier querying
    cookingTime: { type: Number, required: true }, // in minutes
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    servings: { type: Number, required: true },
    ingredients: [IngredientSchema],
    instructions: [{ type: String, required: true }],
    tags: {
      ingredients: [{ type: String, trim: true }],
      categories: [{ type: String, trim: true }],
      timeOfDay: [{ type: String, trim: true }],
      region: { type: String, trim: true, required: true },
      tribe: { type: String, trim: true, required: true },
      holidays: [{ type: String, trim: true }],
    },
    images: [{ type: String }], // Array of Firebase Storage URLs
    videoUrl: { type: String }, // Firebase Storage URL
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    views: { type: Number, default: 0 },
    nutritionInfo: { type: Schema.Types.Mixed }, // Flexible type for now
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'draft',
    },
    moderationNotes: { type: String },
    isActive: { type: Boolean, default: true }, // Default to active, can be set to false for soft delete
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' }, // Assuming an Admin model
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Indexing for frequently queried fields
RecipeSchema.index({ name: 'text', description: 'text', 'tags.ingredients': 'text' }); // For text search
RecipeSchema.index({ chefId: 1 });
RecipeSchema.index({ region: 1, tribe: 1 });
RecipeSchema.index({ status: 1 });
RecipeSchema.index({ 'ratings.average': -1 });

const RecipeModel = mongoose.model<IRecipe>('Recipe', RecipeSchema);

export default RecipeModel; 