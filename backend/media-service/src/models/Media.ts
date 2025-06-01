import mongoose, { Document, Schema } from 'mongoose';

export interface IMedia extends Document {
  originalName: string;
  fileName: string; // This might become the S3 key, or we use a separate s3Key
  s3Key: string; // Key of the object in S3 bucket
  s3Url: string; // Full URL to the S3 object (can be public or pre-signed)
  type: 'image' | 'video' | 'document';
  category: 'recipe' | 'profile' | 'verification' | 'review';
  uploadedBy: mongoose.Schema.Types.ObjectId;
  size: number; // in bytes
  mimeType: string;
  status: 'active' | 'flagged' | 'deleted';
  flaggedReason?: string;
  createdAt: Date;
  updatedAt: Date; // Added by timestamps: true
}

const MediaSchema: Schema = new Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true, unique: true }, // May store original uploaded filename or a generated one
    s3Key: { type: String, required: true, unique: true },
    s3Url: { type: String, required: true },
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
      required: true,
    },
    category: {
      type: String,
      enum: ['recipe', 'profile', 'verification', 'review'],
      required: true,
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming a User model for ref
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'flagged', 'deleted'],
      default: 'active',
    },
    flaggedReason: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

// Indexes
MediaSchema.index({ type: 1, category: 1 });
MediaSchema.index({ uploadedBy: 1 });
MediaSchema.index({ status: 1 });
MediaSchema.index({ createdAt: -1 });

export default mongoose.model<IMedia>('Media', MediaSchema); 