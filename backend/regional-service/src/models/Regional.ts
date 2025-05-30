import { Schema, model, Document } from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     Tribe:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the tribe.
 *           example: Bamileke
 *         description:
 *           type: string
 *           description: A brief description of the tribe.
 *           example: A major ethnic group in Cameroon known for its rich culture and traditions.
 *         traditionalDishes:
 *           type: array
 *           items:
 *             type: string
 *           description: List of traditional dishes associated with the tribe.
 *           example: ["Ndolé", "Koki"]
 *         cookingMethods:
 *           type: array
 *           items:
 *             type: string
 *           description: Common cooking methods used by the tribe.
 *           example: ["Stewing", "Steaming"]
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the tribe is currently active and displayed.
 */
export interface ITribe extends Document {
  name: string;
  description: string;
  traditionalDishes: string[];
  cookingMethods: string[];
  isActive: boolean;
}

// Schema for Tribe
const TribeSchema = new Schema<ITribe> ({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true, trim: true },
  traditionalDishes: [{ type: String, trim: true }],
  cookingMethods: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
});

/**
 * @openapi
 * components:
 *   schemas:
 *     Region:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           format: ObjectId
 *           description: The unique identifier for the region.
 *           example: 60c72b2f9b1d8c001f8e4d5b
 *         name:
 *           type: string
 *           description: Name of the region.
 *           example: West
 *         description:
 *           type: string
 *           description: A brief description of the region.
 *           example: The West Region of Cameroon is known for its vibrant culture and chieftaincies.
 *         tribes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tribe'
 *           description: List of tribes predominantly found in this region.
 *         popularDishes:
 *           type: array
 *           items:
 *             type: string
 *           description: List of popular dishes from this region.
 *           example: ["Poulet DG", "Kondre"]
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *           description: Common ingredients used in the cuisine of this region.
 *           example: ["Plantains", "Cocoyams", "Groundnuts"]
 *         culturalInfo:
 *           type: string
 *           description: General cultural information related to the region's cuisine and traditions.
 *           example: The West Region is famous for its annual cultural festivals like Nyang Nyang.
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the region is currently active and displayed.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the region was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the region was last updated.
 */
export interface IRegion extends Document {
  name: string;
  description: string;
  tribes: ITribe[];
  popularDishes: string[];
  ingredients: string[];
  culturalInfo: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Region
const RegionSchema = new Schema<IRegion>(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    tribes: [TribeSchema], // Embed Tribe schema
    popularDishes: [{ type: String, trim: true }],
    ingredients: [{ type: String, trim: true }],
    culturalInfo: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for searching regions by name
RegionSchema.index({ name: 'text', description: 'text' });

export const Region = model<IRegion>('Region', RegionSchema);
// Note: Tribe is an embedded schema and typically not exported as a standalone model unless needed.
// If you need to query Tribes independently, you would define a separate model for it. 