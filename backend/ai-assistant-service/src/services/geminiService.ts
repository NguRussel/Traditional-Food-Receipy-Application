import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Default model, can be overridden in specific functions or configured further
const DEFAULT_MODEL_NAME = "gemini-1.5-flash-latest"; 

// Default generation config, can be customized
const defaultGenerationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

// Default safety settings, can be customized
const defaultSafetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Generates content based on a textual prompt using the Gemini API.
 * @param promptText The text prompt to send to the Gemini model.
 * @param modelName Optional. The specific Gemini model to use (e.g., "gemini-pro"). Defaults to DEFAULT_MODEL_NAME.
 * @returns The generated text response from the model.
 */
export const generateText = async (promptText: string, modelName: string = DEFAULT_MODEL_NAME): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContentStream(promptText);
    
    // Stream the response and accumulate text
    let text = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      text += chunkText;
    }
    return text;

  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    throw new Error('Failed to generate text content from AI model.');
  }
};

/**
 * Generates content from a chat-like history of messages.
 * @param history An array of message objects, typically alternating user and model roles.
 *                Example: [{ role: "user", parts: [{text: "Hello"}] }, { role: "model", parts: [{text: "Hi there!"}] }]
 * @param newMessage The new message from the user to continue the chat.
 * @param modelName Optional. The specific Gemini model to use. Defaults to DEFAULT_MODEL_NAME.
 * @returns The generated text response from the model.
 */
export const continueChat = async (
    history: { role: string; parts: { text: string }[] }[], 
    newMessage: string, 
    modelName: string = DEFAULT_MODEL_NAME
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ 
        model: modelName, 
        generationConfig: defaultGenerationConfig, 
        safetySettings: defaultSafetySettings 
    });
    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(newMessage);

    let text = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      text += chunkText;
    }
    return text;

  } catch (error) {
    console.error('Error continuing chat with Gemini:', error);
    throw new Error('Failed to generate chat content from AI model.');
  }
};

// You can add more functions here for specific Gemini features like:
// - Function calling
// - Embedding generation
// - Different content types (if needed beyond text for this service) 