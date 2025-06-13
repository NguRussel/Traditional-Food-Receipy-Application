import ConversationLog, { IConversationLog } from '../models/ConversationLog';
import { Types } from 'mongoose'; // For ObjectId if needed, though clerkUserId is string

interface LogInteractionParams {
  clerkUserId?: string;
  sessionId: string;
  interactionType: IConversationLog['interactionType'];
  userInputSummary?: string;
  aiResponseSummary?: string;
  vapiCallId?: string;
  processedSuccessfully: boolean;
  durationMs?: number;
  errorDetails?: string;
  metadata?: Record<string, any>;
}

/**
 * Logs an interaction to the ConversationLog collection.
 * This is a fire-and-forget operation from the perspective of the caller (doesn't throw errors upwards).
 */
export const logInteraction = async (params: LogInteractionParams): Promise<void> => {
  try {
    const logEntry = new ConversationLog({
      clerkUserId: params.clerkUserId,
      sessionId: params.sessionId,
      interactionType: params.interactionType,
      userInputSummary: params.userInputSummary,
      aiResponseSummary: params.aiResponseSummary,
      vapiCallId: params.vapiCallId,
      timestamp: new Date(), // Overrides default for more precise timing if needed, else default works
      processedSuccessfully: params.processedSuccessfully,
      durationMs: params.durationMs,
      errorDetails: params.errorDetails,
      metadata: params.metadata,
    });
    await logEntry.save();
    console.log(`[LoggingService] Interaction logged for session ${params.sessionId}, type: ${params.interactionType}`);
  } catch (error) {
    console.error('[LoggingService] Failed to save conversation log:', error);
    // Decide if this failure needs more handling, e.g., pushing to a dead-letter queue or an alert system.
    // For now, we just log the error and don't let it interrupt the main request flow.
  }
};

// Helper to summarize text for logging (basic example, can be made more sophisticated)
export const summarizeText = (text: string | undefined | null, maxLength: number = 100): string | undefined => {
  if (!text) return undefined;
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}; 