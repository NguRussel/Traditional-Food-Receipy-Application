import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  eventType: string;
  userId?: Types.ObjectId;
  data: any; // Using 'any' for flexible data structure, consider more specific types if possible in future
  timestamp: Date;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsEventSchema: Schema<IAnalyticsEvent> = new Schema(
  {
    eventType: {
      type: String,
      required: true,
      trim: true,
      index: true, // Indexing eventType can be useful for querying
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Assuming you might want to reference a User model in the future (even if not strictly enforced here)
      required: false,
      index: true, // Indexing userId can also be useful
    },
    data: {
      type: Schema.Types.Mixed, // Allows for flexible data structures
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    sessionId: {
      type: String,
      required: true,
      trim: true,
      index: true, // Indexing sessionId can be useful
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
    collection: 'analytics_events', // Explicitly name the collection
    versionKey: false, // Disable the __v versioning key
  }
);

// Compound index example if you frequently query by userId and eventType together
// AnalyticsEventSchema.index({ userId: 1, eventType: 1 });

const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);

export default AnalyticsEvent; 