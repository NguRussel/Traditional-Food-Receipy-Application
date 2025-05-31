import mongoose, { Document, Schema } from 'mongoose';

export interface IMedia extends Document {
  originalName: string;
  fileName: string;
  firebaseUrl: string;
  type: 'image' | 'video' | 'document';
  category: 'recipe' | 'profile' | 'verification' | 'review';
  uploadedBy: mongoose.Schema.Types.ObjectId;
  size: number;
  mimeType: string;
  status: 'active' | 'flagged' | 'deleted';
  flaggedReason?: string;
  createdAt: Date;
  updatedAt: Date; 
}

const MediaSchema: Schema = new Schema(
  {
    originalName: { type: String, required: true, trim: true },
    fileName: { type: String, required: true, unique: true, trim: true },
    firebaseUrl: { type: String, required: true, unique: true },
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
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming a User model exists in the User service
      required: true,
    },
    size: { type: Number, required: true }, // size in bytes
    mimeType: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'flagged', 'deleted'],
      default: 'active',
    },
    flaggedReason: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// Indexing fields for better query performance
MediaSchema.index({ type: 1 });
MediaSchema.index({ category: 1 });
MediaSchema.index({ uploadedBy: 1 });
MediaSchema.index({ status: 1 });
MediaSchema.index({ createdAt: -1 });

const Media = mongoose.model<IMedia>('Media', MediaSchema);

export default Media; 