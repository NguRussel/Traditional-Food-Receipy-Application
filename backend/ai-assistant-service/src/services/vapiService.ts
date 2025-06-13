// VAPI Service - vapiService.ts
// This file will handle interactions with the VAPI AI API using Axios.
import axios from 'axios';
import { logInteraction, summarizeText } from '../utils/loggingService'; // Assuming loggingService is in the same dir or path is adjusted
import { v4 as uuidv4 } from 'uuid'; // For generating a sessionId if VAPI doesn't provide a suitable one

const vapiApiKey = process.env.VAPI_API_KEY;
const VAPI_BASE_URL = 'https://api.vapi.ai'; // Replace with actual VAPI API base URL if different

if (!vapiApiKey) {
  // VAPI might not be a critical error if some functionalities can work without it (e.g. text-only chat)
  // Or if it's only used by specific endpoints.
  console.warn('VAPI_API_KEY is not set in environment variables. VAPI functionalities may be limited.');
}

// Placeholder for VAPI SDK initialization if they have one for Node.js
// import Vapi from '@vapi/node-sdk'; // Hypothetical SDK import
// let vapiClient;
// if (vapiApiKey) {
//   vapiClient = new Vapi(vapiApiKey);
// }

/**
 * Example function: Processes a voice input (e.g., a transcript from VAPI).
 * This function would be triggered by an Express route that VAPI calls via a webhook.
 * 
 * @param vapiPayload - The data received from VAPI (e.g., transcript, call details).
 * @returns {Promise<any>} - A response to be potentially sent back or used otherwise.
 */
export const handleVapiWebhook = async (vapiPayload: any): Promise<any> => {
  const startTime = Date.now();
  // Use VAPI's call ID as session ID if available, otherwise generate one.
  // This part highly depends on the actual VAPI payload structure.
  const vapiCallId = vapiPayload?.call?.id || vapiPayload?.callId || vapiPayload?.call_id;
  const sessionId = vapiCallId || uuidv4();
  // Attempt to get user identifier if VAPI passes it, e.g., in metadata set during call creation.
  const clerkUserId = vapiPayload?.user?.id || vapiPayload?.metadata?.clerkUserId;

  console.log(`[VAPI Service] Received Webhook. Session/Call ID: ${sessionId}`, vapiPayload);

  // Extract transcript or primary user input - adjust to VAPI's actual payload structure
  const transcript = vapiPayload?.message?.transcript || 
                   vapiPayload?.results?.[0]?.alternatives?.[0]?.transcript || 
                   vapiPayload?.transcript;
  
  let processedSuccessfully = true;
  let errorDetails: string | undefined;
  let aiResponseSummary: string | undefined; // Placeholder for AI response based on transcript

  try {
    if (!vapiApiKey) {
        // This check is more critical here as we are about to process.
        processedSuccessfully = false;
        errorDetails = 'VAPI service is not configured (no API key for processing).';
        // Log this specific failure before throwing, so it's recorded.
        await logInteraction({
            clerkUserId,
            sessionId,
            interactionType: 'vapi-call',
            userInputSummary: summarizeText(transcript), // Transcript might be null here
            aiResponseSummary,
            vapiCallId,
            processedSuccessfully: false,
            durationMs: Date.now() - startTime,
            errorDetails,
            metadata: { vapiPayloadType: vapiPayload?.type, source: 'vapi-webhook-config-error' }
        });
        throw new Error(errorDetails);
    }

    // Example: If VAPI sends different types of messages (e.g., transcript, function-call, status)
    const interactionType = vapiPayload?.type === 'transcript' || transcript ? 'voice-transcript' : 'vapi-call';

    if (!transcript && interactionType === 'voice-transcript') { 
      console.warn('[VAPI Service] Expected transcript for a voice-transcript event but none found.');
      processedSuccessfully = false;
      errorDetails = 'No transcript in VAPI payload for an expected voice-transcript event.';
    }

    // --- Future: Interaction with GeminiService or other logic based on transcript would go here ---
    // if (transcript && processedSuccessfully) {
    //   const geminiResponse = await geminiService.generateText(`Transcribed from VAPI: ${transcript}`);
    //   aiResponseSummary = summarizeText(geminiResponse);
    //   // The responseToVapi might include this geminiResponse text for VAPI to speak.
    // }

    // For now, aiResponseSummary is just a simulated processing acknowledgement if successful.
    if (transcript && processedSuccessfully) {
        aiResponseSummary = summarizeText(`AI successfully processed transcript starting with: ${transcript.substring(0,30)}`);
    }

    await logInteraction({
      clerkUserId,
      sessionId,
      interactionType,
      userInputSummary: summarizeText(transcript),
      aiResponseSummary,
      vapiCallId,
      processedSuccessfully,
      durationMs: Date.now() - startTime,
      errorDetails,
      metadata: { vapiPayloadType: vapiPayload?.type, source: 'vapi-webhook' }
    });

    // The response to VAPI depends on its API structure.
    // This might be an empty 200 OK, or JSON to instruct VAPI.
    const responseToVapi = {
      message: `Webhook for call ${sessionId} received. Transcript was ${transcript ? 'processed' : 'not available/applicable'}.`
    };
    console.log(`[VAPI Service] Processed VAPI event for session ${sessionId}.`);
    return { status: 'success', processedTranscript: transcript, responseToVapi };

  } catch (error) {
    // This catch block handles errors from the try block above (e.g., API key missing, or future Gemini calls)
    processedSuccessfully = false; // Ensure this is marked as false
    const catchedErrorDetails = error instanceof Error ? error.message : 'Unknown error processing VAPI webhook';
    console.error('[VAPI Service] Error processing VAPI Webhook:', catchedErrorDetails, error);

    // Log the error interaction
    await logInteraction({
      clerkUserId,
      sessionId,
      // Determine interaction type even in error, if possible from payload
      interactionType: vapiPayload?.type === 'transcript' || transcript ? 'voice-transcript' : 'vapi-call',
      userInputSummary: summarizeText(transcript), // Transcript might be null
      aiResponseSummary: undefined,
      vapiCallId,
      processedSuccessfully: false,
      durationMs: Date.now() - startTime,
      errorDetails: catchedErrorDetails, // Log the error that occurred
      metadata: { vapiPayloadType: vapiPayload?.type, source: 'vapi-webhook-runtime-error' }
    });
    
    // Propagate a new error to be handled by the controller, which sends a 500 to VAPI.
    throw new Error(catchedErrorDetails); 
  }
};

/**
 * Example: Function to initiate a call via VAPI using Axios.
 * This would be used if your backend needs to proactively start a VAPI call.
 * @param phoneNumber The phone number to call.
 * @param assistantId The VAPI assistant ID to use for the call.
 * @returns {Promise<any>} The response from VAPI API.
 */
export const makeVapiCall = async (phoneNumber: string, assistantId: string): Promise<any> => {
  if (!vapiApiKey) {
    throw new Error('VAPI API Key is missing. Cannot make VAPI call.');
  }

  const VAPI_CALL_ENDPOINT = `${VAPI_BASE_URL}/call/phone`; // Hypothetical endpoint

  try {
    const response = await axios.post(
      VAPI_CALL_ENDPOINT, 
      {
        phoneNumber: phoneNumber, 
        assistantId: assistantId,
      },
      {
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('VAPI call initiated successfully:', response.data);
    return response.data; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // error is now narrowed to AxiosError
      console.error(
        'Error making VAPI call (AxiosError):',
        error.response?.status,
        error.response?.data,
        error.message
      );
      throw new Error(
        `VAPI API Error (${error.response?.status || 'Unknown Status'}): ${ 
          error.response?.data ? JSON.stringify(error.response.data) : error.message
        }`
      );
    } else {
      // Handle non-Axios errors
      console.error('Error making VAPI call (Non-AxiosError):', error);
      throw new Error('Failed to make VAPI call due to an unexpected error.');
    }
  }
};

// Add other VAPI interaction functions as needed, using Axios for outbound calls.
// Remember to consult VAPI's official API documentation for correct endpoints, request payloads, and auth methods. 