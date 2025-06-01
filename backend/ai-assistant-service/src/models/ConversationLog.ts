import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface describing the properties of a Conversation Log
export interface IConversationLog extends Document {
  userId?: mongoose.Schema.Types.ObjectId; // Optional, if the user is authenticated
  clerkUserId?: string; // Optional, if using Clerk ID and user is authenticated
  sessionId: string; // To group related interactions
  interactionType: 'text-query' | 'voice-transcript' | 'recipe-suggestion' | 'cooking-help' | 'ingredient-substitute' | 'vapi-call' | 'other';
  userInputSummary?: string; // A brief, PII-scrubbed summary or a hash of the input
  aiResponseSummary?: string; // A brief, PII-scrubbed summary or a hash of the response
  vapiCallId?: string; // If the interaction is related to a VAPI call
  timestamp: Date;
  processedSuccessfully: boolean;
  durationMs?: number; // Time taken to process the request
  errorDetails?: string; // If processedSuccessfully is false
  metadata?: Record<string, any>; // For any other relevant data
}

const ConversationLogSchema: Schema<IConversationLog> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming a User model exists in user-service, for relational integrity if needed later
      required: false,
    },
    clerkUserId: {
      type: String,
      required: false,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    interactionType: {
      type: String,
      required: true,
      enum: ['text-query', 'voice-transcript', 'recipe-suggestion', 'cooking-help', 'ingredient-substitute', 'vapi-call', 'other'],
    },
    userInputSummary: {
      type: String,
      required: false, // Storing full PII input is risky; summaries or non-sensitive parts are better
    },
    aiResponseSummary: {
      type: String,
      required: false,
    },
    vapiCallId: {
        type: String,
        required: false,
        index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    processedSuccessfully: {
      type: Boolean,
      required: true,
    },
    durationMs: {
      type: Number,
      required: false,
    },
    errorDetails: {
        type: String,
        required: false,
    },
    metadata: {
        type: Schema.Types.Mixed,
        required: false,
    }
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

const ConversationLog: Model<IConversationLog> = mongoose.model<IConversationLog>(
  'ConversationLog',
  ConversationLogSchema
);

export default ConversationLog; 