# Assets Folder

This folder contains static assets for the admin users application.

## Images for Sign-in/Sign-up Screen

To add an image to the sign-in/sign-up screen:

1. Place your image file in this folder (e.g., `logo.png`, `background.jpg`, `admin-hero.png`)
2. The image will be accessible at `/assets/your-image-name.ext`
3. Recommended image formats: PNG, JPG, SVG
4. Recommended sizes:
   - Logo: 200x200px or smaller
   - Background: 1920x1080px or similar
   - Hero image: 400x300px

## Background Image Setup

To add a full background image to the right side of the sign-in screen:

1. **Add your background image** to this folder (e.g., `admin-dashboard-bg.jpg`)
2. **Edit the AuthForm component** and uncomment the Image component:
   ```jsx
   <Image
     src="/assets/admin-dashboard-bg.jpg"
     alt="Admin Dashboard Background"
     fill
     className="object-cover"
     priority
   />
   ```
3. **Remove the temporary gradient** by deleting or commenting out:
   ```jsx
   <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 opacity-80" />
   ```

## Example Usage

```jsx
<img src="/assets/logo.png" alt="Company Logo" />
```

## Current Images

- Add your images here and update this list 