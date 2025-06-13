import { Response } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { IAuthRequest } from '../middleware/authMiddleware';
import axios from 'axios';
import FormData from 'form-data'; // Roboflow might prefer form-data for raw image upload

// @desc    Scan image for ingredients
// @route   POST /api/v1/scanner/scan-ingredients
// @access  User (Protected by 'protect' middleware)
export const scanIngredients = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file uploaded.');
  }

  const apiKey = process.env.ROBOFLOW_API_KEY;
  const modelEndpoint = process.env.ROBOFLOW_MODEL_ENDPOINT; // e.g., https://detect.roboflow.com/your-model/1

  if (!apiKey || !modelEndpoint) {
    console.error('Roboflow API key or model endpoint is not configured in .env');
    res.status(500);
    throw new Error('Scanner service is not configured correctly.');
  }

  try {
    // Roboflow API for object detection usually expects the image as base64 encoded data
    // or as a file in a multipart/form-data request.
    // Let's use base64 encoding of the buffer from multer's memoryStorage.
    const imageBase64 = req.file.buffer.toString('base64');

    const response = await axios({
      method: 'POST',
      url: modelEndpoint,
      params: {
        api_key: apiKey,
        // Add other optional params like confidence, overlap, format, labels, stroke as needed by Roboflow
        // e.g., confidence: 40, format: 'json', labels: 'true' 
      },
      data: imageBase64, // Image data as base64 string
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded' // Or could be 'image/jpeg', etc. check Roboflow docs for your model
      }
    });

    // Process the Roboflow API response
    // The structure of 'response.data' will depend on your Roboflow model's output (e.g., predictions array)
    // Example: extracting class names from predictions
    const ingredients = response.data.predictions?.map((pred: any) => pred.class) || [];
    const uniqueIngredients = [...new Set(ingredients)]; // Get unique ingredients

    res.status(200).json({
      message: 'Ingredients scanned successfully',
      ingredients: uniqueIngredients,
      // rawResponse: response.data // Optionally return raw response for debugging
    });

  } catch (error: any) {
    console.error('Error calling Roboflow API:', error.response?.data || error.message);
    res.status(error.response?.status || 500);
    throw new Error('Failed to scan ingredients using external service.');
  }
});

// @desc    Get recipes from scanned ingredients
// @route   POST /api/v1/scanner/suggest-recipes
// @access  Public or User
export const suggestRecipesFromIngredients = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { ingredients } = req.body; // Expecting a list of ingredients

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    res.status(400);
    throw new Error('Please provide a list of ingredients.');
  }

  // TODO: (Commented out for later implementation - Inter-service Communication)
  // Implement logic to query recipe-service or an internal recipe database/cache
  // based on the provided ingredients.
  // This might involve calling the recipe-service's search endpoint with ingredient filters.
  
  // Placeholder response (current behavior)
  res.status(200).json({ 
    message: '[Placeholder] Recipes suggested based on ingredients - Full implementation pending recipe-service integration.',
    providedIngredients: ingredients,
    suggestedRecipes: [
      { id: 'recipe1_placeholder', name: 'Placeholder Recipe 1 for provided ingredients' }, 
      { id: 'recipe2_placeholder', name: 'Placeholder Recipe 2 for provided ingredients' }
    ] 
  });
});

// @desc    Get ingredient database (potentially for typeahead or internal use)
// @route   GET /api/v1/scanner/ingredient-database
// @access  Public or Admin (to be decided - currently public as per routes)
export const getIngredientDatabase = asyncHandler(async (req: IAuthRequest, res: Response) => {
  // For now, using a static list. This could be expanded or moved to a DB.
  const commonIngredients = [
    ' टमाटर (Tomato)', ' प्याज (Onion)', ' लहसुन (Garlic)', ' अदरक (Ginger)', 
    ' हरी मिर्च (Green Chili)', ' धनिया (Coriander)', ' जीरा (Cumin)', ' हल्दी (Turmeric)',
    ' लाल मिर्च पाउडर (Red Chili Powder)', ' गरम मसाला (Garam Masala)', ' नमक (Salt)',
    ' तेल (Oil)', ' घी (Ghee)', ' नींबू (Lemon)', ' आलू (Potato)', ' गोभी (Cauliflower)',
    ' मटर (Peas)', ' गाजर (Carrot)', ' बैंगन (Eggplant/Brinjal)', ' भिंडी (Okra)',
    ' पालक (Spinach)', ' मेथी (Fenugreek leaves)', ' सरसों का साग (Mustard greens)',
    ' मूंग दाल (Moong Dal)', ' चना दाल (Chana Dal)', ' अरहर दाल (Toor Dal)',
    ' राजमा (Kidney Beans)', ' छोले (Chickpeas)', ' चावल (Rice)', ' आटा (Wheat Flour)',
    ' बेसन (Gram Flour)', ' सूजी (Semolina)', ' दही (Yogurt/Curd)', ' दूध (Milk)',
    ' पनीर (Paneer/Indian Cheese)', ' चिकन (Chicken)', ' मटन (Mutton)', ' मछली (Fish)',
    ' अंडा (Egg)', ' झींगा (Prawns)', ' शिमला मिर्च (Capsicum)', ' पत्ता गोभी (Cabbage)',
    ' मूली (Radish)', ' चुकंदर (Beetroot)', ' नारियल (Coconut)', ' इमली (Tamarind)',
    ' करी पत्ता (Curry Leaves)', ' सरसों के बीज (Mustard Seeds)', ' हींग (Asafoetida)',
    ' काली मिर्च (Black Pepper)', ' लौंग (Cloves)', ' इलायची (Cardamom)',
    ' दालचीनी (Cinnamon)', ' तेज पत्ता (Bay Leaf)', ' कसूरी मेथी (Dried Fenugreek Leaves)',
    // Cameroonian specific additions (examples - expand as needed)
    ' Ndoleh (Bitterleaf)', ' Plantain', ' Cassava', ' Cocoyam', ' Egusi (Melon Seeds)',
    ' Okra (Gumbo)', ' Palm Oil', ' Crayfish (Dried)', ' Smoked Fish', ' Bush Mango (Ogbono)',
    ' Afang Leaf (Okazi)', ' Waterleaf', ' Periwinkle', ' Snail', ' Pepper Soup Spices',
    ' Scotch Bonnet Pepper', 'Maggi Cube', 'Yam'
  ];
  
  res.status(200).json({
    message: 'Ingredient database retrieved successfully',
    count: commonIngredients.length,
    ingredients: commonIngredients.sort()
  });
});

// @desc    Identify dish from image
// @route   POST /api/v1/scanner/identify-dish
// @access  Public or User
export const identifyDish = asyncHandler(async (req: IAuthRequest, res: Response) => {
  // TODO: Implement logic to receive image
  // TODO: Call external vision API with capabilities for dish recognition
  // TODO: Process the API response

  // Placeholder response
  if (!req.file) {
    res.status(400);
    throw new Error('No image file uploaded for dish identification.');
  }

  const apiKey = process.env.ROBOFLOW_API_KEY;
  // Assuming you might have a different model/endpoint for dish identification
  // Or your primary model handles both. Adjust ROBOFLOW_DISH_MODEL_ENDPOINT accordingly in .env
  const modelEndpoint = process.env.ROBOFLOW_DISH_MODEL_ENDPOINT || process.env.ROBOFLOW_MODEL_ENDPOINT;

  if (!apiKey || !modelEndpoint) {
    console.error('Roboflow API key or dish model endpoint is not configured in .env');
    res.status(500);
    throw new Error('Dish identification service is not configured correctly.');
  }

  try {
    const imageBase64 = req.file.buffer.toString('base64');

    const response = await axios({
      method: 'POST',
      url: modelEndpoint,
      params: {
        api_key: apiKey,
        // Add other Roboflow params as needed
      },
      data: imageBase64,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Process the Roboflow API response for dish identification
    // This will depend on your model's output. 
    // For instance, it might be the top predicted class.
    const predictions = response.data.predictions;
    let identifiedDish = { name: 'Unknown', confidence: 0 };

    if (predictions && predictions.length > 0) {
      // Assuming the first prediction is the most relevant for a single dish image
      const topPrediction = predictions.reduce((max: any, pred: any) => pred.confidence > max.confidence ? pred : max, predictions[0]);
      identifiedDish = {
        name: topPrediction.class,
        confidence: topPrediction.confidence
      };
    }

    res.status(200).json({
      message: 'Dish identified successfully',
      dish: identifiedDish,
      // rawResponse: response.data // For debugging
    });

  } catch (error: any) {
    console.error('Error calling Roboflow API for dish identification:', error.response?.data || error.message);
    res.status(error.response?.status || 500);
    throw new Error('Failed to identify dish using external service.');
  }
});

// --- Admin Specific Controllers ---

// @desc    Get scanning accuracy metrics
// @route   GET /api/v1/scanner/admin/accuracy-metrics
// @access  Admin
export const getAccuracyMetrics = asyncHandler(async (req: IAuthRequest, res: Response) => {
  // TODO: Implement logic to fetch or calculate accuracy metrics.
  //       This might involve looking at logs, feedback, or a dedicated metrics store.

  // Placeholder response
  res.status(200).json({ 
    message: '[Placeholder] Accuracy metrics retrieved',
    metrics: { overallAccuracy: '90%', commonMistakes: ['plantain vs banana'] } // Example data
  });
});

// @desc    Trigger model training (if applicable for the chosen AI service or custom models)
// @route   POST /api/v1/scanner/admin/train-model
// @access  Admin
export const trainModel = asyncHandler(async (req: IAuthRequest, res: Response) => {
  // TODO: Implement logic to trigger a training pipeline for the vision model if supported/needed.
  //       This could be an API call to an MLOps platform or a script execution.
  
  // Placeholder response
  res.status(200).json({ 
    message: '[Placeholder] Model training process initiated' 
  });
});

// @desc    Update ingredient database (if managed by this service)
// @route   PUT /api/v1/scanner/admin/ingredient-database
// @access  Admin
export const updateIngredientDatabase = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { updates } = req.body;
  // TODO: Implement logic to update the ingredient database.
  //       This depends on how the ingredient database is stored (e.g., file, DB collection).

  // Placeholder response
  res.status(200).json({ 
    message: '[Placeholder] Ingredient database updated successfully',
    updatedCount: updates ? (updates as any[]).length : 0 // Example data
  });
}); 