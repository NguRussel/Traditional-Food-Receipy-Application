// Assets Index File
// This file exports all images and assets for easy importing

// App Icons
export const AppIcons = {
  logo: require('./icon.png'),
  adaptiveIcon: require('./adaptive-icon.png'),
  favicon: require('./favicon.png'),
};

// Onboarding Images (placeholders for now - you can replace with actual images)
export const OnboardingImages = {
  heritage: require('./images/onboarding/heritage.png'), // Will be created
  chefs: require('./images/onboarding/chefs.png'), // Will be created
  cuisine: require('./images/onboarding/cuisine.png'), // Will be created
};

// Illustrations (placeholders for now)
export const Illustrations = {
  cooking: require('./images/illustrations/cooking.png'), // Will be created
  community: require('./images/illustrations/community.png'), // Will be created
  recipes: require('./images/illustrations/recipes.png'), // Will be created
};

// Icons (can be used for UI elements)
export const UIIcons = {
  // Placeholder for custom UI icons
};

// Food Images (placeholders for recipe images)
export const FoodImages = {
  ndole: require('./images/food/ndole.png'), // Will be created
  achu: require('./images/food/achu.png'), // Will be created
  koki: require('./images/food/koki.png'), // Will be created
};

// Export everything for easy access
export default {
  AppIcons,
  OnboardingImages,
  Illustrations,
  UIIcons,
  FoodImages,
}; 