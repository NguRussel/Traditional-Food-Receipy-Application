import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description?: string;
  url: string;
  uploadedBy: string; // userId or chefId
  recipeId?: string;
  region?: string;
  category?: string;
  isPublished: boolean;
  isFlagged?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const VideoSchema = new Schema<IVideo>({
  title: { type: String, required: true },
  description: String,
  url: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  recipeId: String,
  region: String,
  category: String,
  isPublished: { type: Boolean, default: true },
  isFlagged: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IVideo>('Video', VideoSchema);
