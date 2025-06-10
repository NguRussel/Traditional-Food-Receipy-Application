# Assets Organization Guide for AFRI-Plates Mobile App

## 📁 Folder Structure

Your assets are now organized in a clean, scalable structure:

```
assets/
├── index.ts                    # Main assets export file
├── icon.png                   # App icon
├── adaptive-icon.png           # Adaptive icon for Android
├── favicon.png                # Web favicon
└── images/
    ├── onboarding/            # Onboarding screen images
    │   ├── heritage.png       # Cultural heritage illustration
    │   ├── chefs.png          # Master chefs illustration  
    │   └── cuisine.png        # Cameroonian cuisine illustration
    ├── icons/                 # Custom UI icons
    │   ├── cooking.png        # Cooking related icons
    │   ├── social.png         # Social feature icons
    │   └── navigation.png     # Navigation icons
    ├── illustrations/         # Custom illustrations
    │   ├── cooking.png        # Cooking process illustrations
    │   ├── community.png      # Community features
    │   └── recipes.png        # Recipe-related illustrations
    └── food/                  # Food and recipe images
        ├── ndole.png          # Traditional Ndolé dish
        ├── achu.png           # Traditional Achu dish
        └── koki.png           # Traditional Koki dish
```

## 🎨 Design Improvements Made

### Enhanced Onboarding Screens

1. **Better Visual Hierarchy**
   - Larger, more prominent titles
   - Improved text shadows for better readability
   - Better spacing and proportions

2. **Enhanced Animations**
   - Fade-in animations for content
   - Scale animations for icons
   - Slide-up animations for text
   - Pulse rings around icons for visual interest

3. **Improved UI Elements**
   - Step indicator showing current progress
   - Interactive pagination dots
   - Enhanced skip button with background
   - Better call-to-action button with "Start Cooking"

4. **Visual Enhancements**
   - Decorative background circles
   - Gradient backgrounds with multiple colors
   - Accent colors for visual contrast
   - Enhanced shadows and elevation

5. **Content Improvements**
   - Feature checkmarks highlighting key benefits
   - More descriptive and engaging text
   - Better iconography choices

## 🖼️ Image Requirements

### Onboarding Images (320x320px recommended)
- **heritage.png**: Cultural symbols, traditional patterns, family cooking
- **chefs.png**: Professional chefs, cooking videos, tutorials
- **cuisine.png**: Traditional Cameroonian dishes, ingredients, regions map

### Icons (24x24px to 48x48px)
- Vector-based icons work best
- Consistent style and color scheme
- High contrast for accessibility

### Food Images (Square format recommended)
- High-quality photos of dishes
- Consistent lighting and styling
- Show appetizing, authentic presentations

## 📱 Usage Examples

### Importing Assets
```typescript
// Import from the main assets file
import Assets, { OnboardingImages, FoodImages } from '../assets';

// Use in components
<Image source={OnboardingImages.heritage} style={styles.image} />
<Image source={FoodImages.ndole} style={styles.foodImage} />
```

### Adding New Assets
1. Add image files to appropriate folder
2. Update `assets/index.ts` with new exports
3. Use TypeScript for better intellisense

## 🎯 Next Steps

### To Complete Your Onboarding Design:

1. **Add Real Images**
   - Replace placeholder images with actual Cameroonian food photos
   - Create or source cultural heritage illustrations
   - Add chef photos or cooking illustrations

2. **Custom Illustrations**
   - Commission or create custom illustrations that represent Cameroonian culture
   - Use consistent color palette matching your brand
   - Ensure illustrations are culturally authentic

3. **Icon Set**
   - Create a consistent icon set for the app
   - Use SVG format for scalability
   - Maintain consistent style across all icons

4. **Food Photography**
   - Take high-quality photos of traditional dishes
   - Ensure consistent lighting and styling
   - Show appetizing presentations

## 🔧 Technical Recommendations

### Image Optimization
- Use WebP format for better compression
- Provide @2x and @3x versions for different screen densities
- Keep file sizes under 500KB for better performance

### Naming Conventions
- Use kebab-case for file names: `traditional-ndole.png`
- Include descriptive names: `chef-cooking-tutorial.png`
- Version files when needed: `logo-v2.png`

### Performance Tips
- Lazy load images when possible
- Use placeholder images while loading
- Implement image caching for better UX

## 🎨 Design Resources

### Free Cameroonian Culture Images
- Unsplash: Search for "Cameroon food", "African cuisine"
- Pexels: Traditional African cooking photos
- Pixabay: Cultural and food-related images

### Icon Resources
- Feather Icons: Clean, consistent icon set
- Heroicons: Modern icon library
- React Native Vector Icons: Built-in icon sets

### Illustration Tools
- Figma: Free design tool with illustration capabilities
- Canva: Easy-to-use design templates
- Adobe Illustrator: Professional illustration tool

Remember to ensure all images you use have proper licensing for commercial use! 