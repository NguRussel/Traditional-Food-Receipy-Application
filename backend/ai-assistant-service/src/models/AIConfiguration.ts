import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface describing the properties of an AI Configuration entry
export interface IAIConfiguration extends Document {
  key: string; // Unique key for the configuration setting
  value: any; // The value of the configuration (can be string, number, boolean, object)
  description?: string; // Optional description of what this configuration does
  lastUpdatedBy?: mongoose.Schema.Types.ObjectId; // Admin who last updated this
  clerkUserIdLastUpdatedBy?: string; // Clerk ID of admin who last updated
  isActive: boolean; // To enable/disable a configuration without deleting
  tags?: string[]; // For categorizing configurations
}

const AIConfigurationSchema: Schema<IAIConfiguration> = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true, // Ensure configuration keys are unique
      index: true,
    },
    value: {
      type: Schema.Types.Mixed, // Allows for flexible data types
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin', // Assuming an Admin model might exist, for relational integrity
      required: false,
    },
    clerkUserIdLastUpdatedBy: {
        type: String,
        required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: {
        type: [String],
        required: false,
    }
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

const AIConfiguration: Model<IAIConfiguration> = mongoose.model<IAIConfiguration>(
  'AIConfiguration',
  AIConfigurationSchema
);

export default AIConfiguration; 