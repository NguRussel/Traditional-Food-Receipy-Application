import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { IAuthRequest } from '../middleware/authMiddleware'; // Assuming user info might be needed
import * as geminiService from '../services/geminiService';
import * as vapiService from '../services/vapiService';
import ConversationLog, { IConversationLog } from '../models/ConversationLog'; // Import the model
import { FilterQuery } from 'mongoose';
import AIConfiguration, { IAIConfiguration } from '../models/AIConfiguration'; // Import the model
import { logInteraction, summarizeText } from '../utils/loggingService'; // Added
import { v4 as uuidv4 } from 'uuid'; // Added

// @desc    Process voice query (likely via VAPI webhook)
// @route   POST /api/v1/ai-assistant/voice-query
// @access  Public (or as per VAPI setup - VAPI might have its own auth to call this webhook)
export const processVoiceQuery = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // This endpoint would be called by VAPI. 
  // The vapiService.handleVapiWebhook will process the payload.
  // It might then internally call geminiService for NLU if needed.
  console.log('AI Assistant Controller: Received voice query webhook', req.body);
  try {
    const vapiPayload = req.body;
    const result = await vapiService.handleVapiWebhook(vapiPayload);
    
    // The response to VAPI depends on its API requirements for webhooks.
    // It might be a direct set of instructions for VAPIs voice agent or just a 200 OK.
    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing voice query:', error);
    // Ensure a response is sent to VAPI even in case of error, 
    // as it might retry or log failures otherwise.
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Error processing voice query', error: errorMessage });
  }
});

// @desc    Process text query
// @route   POST /api/v1/ai-assistant/text-query
// @access  Private (User role)
export const processTextQuery = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const { query, history } = req.body; 
  const clerkUserId = req.user?.id;
  const sessionId = uuidv4(); // Generate a unique session ID for this interaction
  const startTime = Date.now();

  if (!query) {
    const err = new Error('Query text is required');
    (err as any).status = 400;
    // Log failed interaction before throwing
    await logInteraction({
      clerkUserId,
      sessionId,
      interactionType: 'text-query',
      userInputSummary: summarizeText(query),
      processedSuccessfully: false,
      errorDetails: err.message,
      durationMs: Date.now() - startTime,
    });
    return next(err);
  }

  try {
    let responseText;
    if (history && Array.isArray(history) && history.length > 0) {
      responseText = await geminiService.continueChat(history, query);
    } else {
      const initialPrompt = `User query: "${query}". Provide a helpful and concise response related to Cameroonian food, recipes, or cooking assistance.`;
      responseText = await geminiService.generateText(initialPrompt);
    }
    const durationMs = Date.now() - startTime;

    await logInteraction({
      clerkUserId,
      sessionId,
      interactionType: 'text-query',
      userInputSummary: summarizeText(query),
      aiResponseSummary: summarizeText(responseText),
      processedSuccessfully: true,
      durationMs,
    });

    res.status(200).json({ response: responseText, sessionId }); // Optionally return sessionId
  } catch (error) {
    const durationMs = Date.now() - startTime;
    let errorMessage = 'Unknown error during text query processing';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if ('status' in error && typeof (error as any).status === 'number') {
        statusCode = (error as any).status;
      }
    }
    
    await logInteraction({
      clerkUserId,
      sessionId,
      interactionType: 'text-query',
      userInputSummary: summarizeText(query),
      processedSuccessfully: false,
      errorDetails: errorMessage,
      durationMs,
    });
    
    const newError = new Error(errorMessage);
    (newError as any).status = statusCode; 
    next(newError);
  }
});

// @desc    Get AI recipe suggestions
// @route   POST /api/v1/ai-assistant/recipe-suggestions
// @access  Private (User role)
export const getAIRecipeSuggestions = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const { preferences, ingredients, query } = req.body;
  const clerkUserId = req.user?.id;
  const sessionId = uuidv4();
  const startTime = Date.now();
  const userInput = `Query: ${query}, Prefs: ${preferences}, Ingreds: ${ingredients?.join(', ')}`;

  if (!query && (!ingredients || ingredients.length === 0)) {
    const err = new Error('Please provide a query or a list of ingredients for recipe suggestions.');
    (err as any).status = 400;
    await logInteraction({
      clerkUserId,
      sessionId,
      interactionType: 'recipe-suggestion',
      userInputSummary: summarizeText(userInput),
      processedSuccessfully: false,
      errorDetails: err.message,
      durationMs: Date.now() - startTime,
    });
    return next(err);
  }

  let prompt = "Suggest Cameroonian recipes based on the following information:";
  if (query) prompt += `\nUser query: "${query}"`;
  if (preferences) prompt += `\nUser preferences: "${preferences}"`;
  if (ingredients && ingredients.length > 0) prompt += `\nAvailable ingredients: ${ingredients.join(', ')}`;
  prompt += "\nProvide 3-5 suggestions with a brief description for each.";

  try {
    const suggestions = await geminiService.generateText(prompt);
    const durationMs = Date.now() - startTime;
    await logInteraction({
      clerkUserId,
      sessionId,
      interactionType: 'recipe-suggestion',
      userInputSummary: summarizeText(userInput),
      aiResponseSummary: summarizeText(suggestions),
      processedSuccessfully: true,
      durationMs,
    });
    res.status(200).json({ suggestions, sessionId });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    let errorMessage = 'Unknown error during recipe suggestions';
    let statusCode = 500;
    if (error instanceof Error) {
      errorMessage = error.message;
      if ('status' in error && typeof (error as any).status === 'number') statusCode = (error as any).status;
    }
    await logInteraction({
      clerkUserId,
      sessionId,
      interactionType: 'recipe-suggestion',
      userInputSummary: summarizeText(userInput),
      processedSuccessfully: false,
      errorDetails: errorMessage,
      durationMs,
    });
    const newError = new Error(errorMessage);
    (newError as any).status = statusCode;
    next(newError);
  }
});

// @desc    Get cooking assistance
// @route   POST /api/v1/ai-assistant/cooking-help
// @access  Private (User role)
export const getCookingHelp = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const { recipeName, step, question } = req.body; 
  const clerkUserId = req.user?.id;
  const sessionId = uuidv4();
  const startTime = Date.now();
  const userInput = `Recipe: ${recipeName}, Step: ${step}, Question: ${question}`;

  if (!question) {
    const err = new Error('A question is required for cooking help.');
    (err as any).status = 400;
    await logInteraction({
      clerkUserId,
      sessionId,
      interactionType: 'cooking-help',
      userInputSummary: summarizeText(userInput),
      processedSuccessfully: false,
      errorDetails: err.message,
      durationMs: Date.now() - startTime,
    });
    return next(err);
  }

  let prompt = `The user needs help with cooking.`;
  if (recipeName) prompt += ` For the recipe "${recipeName}".`;
  if (step) prompt += ` At step "${step}".`;
  prompt += `\nUser's question: "${question}"`;
  prompt += "\nProvide a clear, concise, and helpful answer.";

  try {
    const helpResponse = await geminiService.generateText(prompt);
    const durationMs = Date.now() - startTime;
    await logInteraction({
      clerkUserId,
      sessionId,
      interactionType: 'cooking-help',
      userInputSummary: summarizeText(userInput),
      aiResponseSummary: summarizeText(helpResponse),
      processedSuccessfully: true,
      durationMs,
    });
    res.status(200).json({ response: helpResponse, sessionId });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    let errorMessage = 'Unknown error during cooking help';
    let statusCode = 500;
    if (error instanceof Error) {
      errorMessage = error.message;
      if ('status' in error && typeof (error as any).status === 'number') statusCode = (error as any).status;
    }
    await logInteraction({
      clerkUserId,
      sessionId,
      interactionType: 'cooking-help',
      userInputSummary: summarizeText(userInput),
      processedSuccessfully: false,
      errorDetails: errorMessage,
      durationMs,
    });
    const newError = new Error(errorMessage);
    (newError as any).status = statusCode;
    next(newError);
  }
});

// @desc    Get ingredient substitutes
// @route   POST /api/v1/ai-assistant/ingredient-substitute
// @access  Private (User role)
export const getIngredientSubstitute = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const { ingredientToReplace, recipeContext, dietaryRestrictions } = req.body;
  const clerkUserId = req.user?.id;
  const sessionId = uuidv4();
  const startTime = Date.now();
  const userInput = `Ingredient: ${ingredientToReplace}, Context: ${recipeContext}, Restrictions: ${dietaryRestrictions}`;

  if (!ingredientToReplace) {
    const err = new Error('Ingredient to replace is required.');
    (err as any).status = 400;
    await logInteraction({
      clerkUserId,
      sessionId,
      interactionType: 'ingredient-substitute',
      userInputSummary: summarizeText(userInput),
      processedSuccessfully: false,
      errorDetails: err.message,
      durationMs: Date.now() - startTime,
    });
    return next(err);
  }

  let prompt = `Suggest substitutes for the ingredient: "${ingredientToReplace}".`;
  if (recipeContext) prompt += ` This is for a recipe described as: "${recipeContext}".`;
  if (dietaryRestrictions) prompt += ` Keep in mind these dietary restrictions: "${dietaryRestrictions}".`;
  prompt += "\nProvide 1-3 suitable substitutes with brief explanations or quantity adjustments if necessary.";

  try {
    const substitutes = await geminiService.generateText(prompt);
    const durationMs = Date.now() - startTime;
    await logInteraction({
      clerkUserId,
      sessionId,
      interactionType: 'ingredient-substitute',
      userInputSummary: summarizeText(userInput),
      aiResponseSummary: summarizeText(substitutes),
      processedSuccessfully: true,
      durationMs,
    });
    res.status(200).json({ substitutes, sessionId });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    let errorMessage = 'Unknown error during ingredient substitution';
    let statusCode = 500;
    if (error instanceof Error) {
      errorMessage = error.message;
      if ('status' in error && typeof (error as any).status === 'number') statusCode = (error as any).status;
    }
    await logInteraction({
      clerkUserId,
      sessionId,
      interactionType: 'ingredient-substitute',
      userInputSummary: summarizeText(userInput),
      processedSuccessfully: false,
      errorDetails: errorMessage,
      durationMs,
    });
    const newError = new Error(errorMessage);
    (newError as any).status = statusCode;
    next(newError);
  }
});

// --- Admin Specific Endpoints (Placeholders) ---

// @desc    Get AI Assistant usage analytics
// @route   GET /api/v1/ai-assistant/admin/usage-analytics
// @access  Private (Admin role)
export const getAIAssistantUsageAnalytics = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { timeframe = 'all', startDate, endDate } = req.query; // timeframe can be '24h', '7d', '30d', 'custom'

    let dateFilter: FilterQuery<IConversationLog> = {};
    const now = new Date();

    if (timeframe === 'custom' && startDate && endDate) {
      dateFilter.timestamp = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    } else if (timeframe === '24h') {
      dateFilter.timestamp = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
    } else if (timeframe === '7d') {
      dateFilter.timestamp = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    } else if (timeframe === '30d') {
      dateFilter.timestamp = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    } // Default is 'all', so no date filter applied if not specified

    // 1. Total Interactions
    const totalInteractions = await ConversationLog.countDocuments(dateFilter);

    // 2. Interactions by Type
    const interactionsByType = await ConversationLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$interactionType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { type: '$_id', count: 1, _id: 0 } }
    ]);

    // 3. Success vs. Failed Interactions
    const successStatus = await ConversationLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$processedSuccessfully', count: { $sum: 1 } } },
      { $project: { status: { $cond: [ { $eq: ['$_id', true] }, 'successful', 'failed'] }, count: 1, _id: 0 } }
    ]);

    // 4. Active Users (unique clerkUserIds with interactions in the period)
    const activeUsersCount = await ConversationLog.distinct('clerkUserId', {
      ...dateFilter,
      clerkUserId: { $exists: true, $ne: null }
    }).then(users => users.length);
    
    // 5. Active Sessions (unique sessionIds)
    const activeSessionsCount = await ConversationLog.distinct('sessionId', dateFilter)
        .then(sessions => sessions.length);

    res.status(200).json({
      message: 'AI assistant usage analytics fetched successfully',
      timeframe: timeframe === 'custom' && startDate && endDate ? `custom (${startDate} to ${endDate})` : timeframe,
      appliedDateFilter: dateFilter.timestamp || 'all time',
      analytics: {
        totalInteractions,
        interactionsByType,
        successStatus,
        activeUsersCount,
        activeSessionsCount,
        // More analytics can be added here (e.g., average duration, error rates by type)
      },
    });
  } catch (error) {
    console.error('Error fetching AI assistant usage analytics:', error);
    next(error);
  }
});

// @desc    Update AI Assistant configuration
// @route   PUT /api/v1/ai-assistant/admin/configuration
// @access  Private (Admin role)
export const updateAIAssistantConfiguration = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const { key, value, description, isActive, tags } = req.body;
  const adminClerkId = req.user?.id;

  if (!key || value === undefined) {
    res.status(400);
    throw new Error('Configuration key and value are required.');
  }

  const updateData: Partial<IAIConfiguration> = {
    value,
    clerkUserIdLastUpdatedBy: adminClerkId,
  };

  if (description !== undefined) updateData.description = description;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [tags];

  let action = 'updated'; // Assume update by default

  try {
    const existingConfig = await AIConfiguration.findOne({ key });
    if (!existingConfig) {
      action = 'created';
    }

    const configuration = await AIConfiguration.findOneAndUpdate(
      { key }, 
      { $set: updateData }, 
      { 
        new: true, 
        upsert: true, 
        runValidators: true, 
      }
    );

    res.status(200).json({
      message: `Configuration for key '${key}' ${action} successfully.`, 
      data: configuration,
    });
  } catch (error) {
    // If 'action' is still 'updated', it means we intended to update an existing one when the error occurred.
    // If it became 'created', it means we were trying to create a new one.
    console.error(`Error ${action === 'updated' && !await AIConfiguration.findOne({key}) ? 'creating (after initial check failed or race condition)' : action} AI configuration for key '${key}':`, error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
        res.status(400);
        throw error; 
    } else if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
        res.status(409); 
        throw new Error(`Configuration key '${key}' already exists or caused a conflict.`);
    }
    next(error); 
  }
});

// @desc    Get AI Assistant conversation logs
// @route   GET /api/v1/ai-assistant/admin/conversation-logs
// @access  Private (Admin role)
export const getAIAssistantConversationLogs = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const { 
    userId, // Mongoose ObjectId as string
    clerkUserId, 
    sessionId, 
    interactionType, 
    processedSuccessfully, // boolean as string
    startDate, // ISO date string
    endDate,   // ISO date string
    vapiCallId
  } = req.query;

  const query: FilterQuery<IConversationLog> = {};

  if (userId) query.userId = userId as string;
  if (clerkUserId) query.clerkUserId = clerkUserId as string;
  if (sessionId) query.sessionId = sessionId as string;
  if (interactionType) query.interactionType = interactionType as string;
  if (vapiCallId) query.vapiCallId = vapiCallId as string;
  if (processedSuccessfully) query.processedSuccessfully = processedSuccessfully === 'true';
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = new Date(startDate as string);
    }
    if (endDate) {
      query.timestamp.$lte = new Date(endDate as string);
    }
  }
  
  try {
    const logs = await ConversationLog.find(query)
      .sort({ timestamp: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .lean(); // Use .lean() for faster queries if not modifying docs

    const totalLogs = await ConversationLog.countDocuments(query);
    const totalPages = Math.ceil(totalLogs / limit);

    res.status(200).json({
      message: 'Conversation logs fetched successfully',
      data: logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalLogs,
        pageSize: limit,
      },
      filtersApplied: req.query // Reflect back applied filters for clarity
    });
  } catch (error) {
    console.error('Error fetching conversation logs:', error);
    next(error);
  }
}); 