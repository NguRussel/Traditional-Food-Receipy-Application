import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ThemeConfig } from '../../constants/Colors';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

interface IdentifiedIngredient {
  name: string;
  confidence: number;
  category: string;
}

interface SuggestedRecipe {
  id: string;
  name: string;
  description: string;
  matchPercentage: number;
  missingIngredients: string[];
  cookingTime: number;
  difficulty: string;
}

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<IdentifiedIngredient[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<SuggestedRecipe[]>([]);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setScannedImage(photo.uri);
        setIsCameraVisible(false);
        await processImage(photo.uri);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Camera Error',
          text2: 'Failed to take picture',
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library permission to use this feature');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setIsProcessing(true);
      setScannedImage(result.assets[0].uri);
      await processImage(result.assets[0].uri);
      setIsProcessing(false);
    }
  };

  const processImage = async (imageUri: string) => {
    // Simulate AI processing - in real app, this would call your SCANNER-SERVICE
    setTimeout(() => {
      // Mock identified ingredients
      const mockIngredients: IdentifiedIngredient[] = [
        { name: 'Tomatoes', confidence: 0.92, category: 'vegetables' },
        { name: 'Onions', confidence: 0.88, category: 'vegetables' },
        { name: 'Bell Peppers', confidence: 0.85, category: 'vegetables' },
        { name: 'Garlic', confidence: 0.78, category: 'herbs' },
      ];

      // Mock suggested recipes
      const mockRecipes: SuggestedRecipe[] = [
        {
          id: '1',
          name: 'Jollof Rice',
          description: 'Classic West African rice dish with tomatoes and spices',
          matchPercentage: 85,
          missingIngredients: ['Rice', 'Stock cubes', 'Palm oil'],
          cookingTime: 45,
          difficulty: 'Medium',
        },
        {
          id: '2',
          name: 'Pepper Soup',
          description: 'Spicy Cameroonian soup with fresh vegetables',
          matchPercentage: 70,
          missingIngredients: ['Fish', 'Pepper soup spice', 'Plantain'],
          cookingTime: 30,
          difficulty: 'Easy',
        },
        {
          id: '3',
          name: 'Vegetable Stir Fry',
          description: 'Quick and healthy mixed vegetable dish',
          matchPercentage: 90,
          missingIngredients: ['Vegetable oil', 'Ginger'],
          cookingTime: 15,
          difficulty: 'Easy',
        },
      ];

      setIdentifiedIngredients(mockIngredients);
      setSuggestedRecipes(mockRecipes);
      
      Toast.show({
        type: 'success',
        text1: 'Ingredients Identified!',
        text2: `Found ${mockIngredients.length} ingredients`,
      });
    }, 2000);
  };

  const resetScanner = () => {
    setScannedImage(null);
    setIdentifiedIngredients([]);
    setSuggestedRecipes([]);
    setIsCameraVisible(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={Colors.light.textMuted} />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          Please grant camera permission to scan ingredients
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={() => Camera.requestCameraPermissionsAsync()}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isCameraVisible) {
    return (
      <View style={styles.cameraContainer}>
        <Camera style={styles.camera} type={type} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsCameraVisible(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>Scan Ingredients</Text>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={() => setType(type === CameraType.back ? CameraType.front : CameraType.back)}
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.scanFrame} />
            
            <View style={styles.cameraFooter}>
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.galleryButton} onPress={pickFromGallery}>
                  <Ionicons name="images" size={24} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
                  onPress={takePicture}
                  disabled={isProcessing}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
                
                <View style={styles.placeholder} />
              </View>
              
              <Text style={styles.instructionText}>
                Point camera at ingredients and tap to scan
              </Text>
            </View>
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ingredient Scanner</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={24} color={Colors.light.textPrimary} />
          </TouchableOpacity>
        </View>

        {!scannedImage ? (
          /* Scanner Introduction */
          <View style={styles.introContainer}>
            <View style={styles.scannerIcon}>
              <Ionicons name="scan" size={80} color={Colors.light.primary} />
            </View>
            
            <Text style={styles.introTitle}>Discover Recipes from Your Ingredients</Text>
            <Text style={styles.introDescription}>
              Scan ingredients you have at home and get personalized Cameroonian recipe suggestions
            </Text>

            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Ionicons name="camera" size={24} color={Colors.light.primary} />
                <Text style={styles.featureText}>Smart Recognition</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="restaurant" size={24} color={Colors.light.primary} />
                <Text style={styles.featureText}>Recipe Suggestions</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="leaf" size={24} color={Colors.light.primary} />
                <Text style={styles.featureText}>Fresh Ingredients</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setIsCameraVisible(true)}
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Scan with Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={pickFromGallery}>
                <Ionicons name="images" size={20} color={Colors.light.primary} />
                <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Results */
          <View style={styles.resultsContainer}>
            {/* Scanned Image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: scannedImage }} style={styles.scannedImage} />
              <TouchableOpacity style={styles.retakeButton} onPress={resetScanner}>
                <Ionicons name="camera" size={16} color="white" />
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
            </View>

            {isProcessing ? (
              <View style={styles.processingContainer}>
                <Text style={styles.processingText}>Analyzing ingredients...</Text>
              </View>
            ) : (
              <>
                {/* Identified Ingredients */}
                {identifiedIngredients.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Identified Ingredients</Text>
                    <View style={styles.ingredientsGrid}>
                      {identifiedIngredients.map((ingredient, index) => (
                        <View key={index} style={styles.ingredientChip}>
                          <Text style={styles.ingredientName}>{ingredient.name}</Text>
                          <Text style={styles.ingredientConfidence}>
                            {Math.round(ingredient.confidence * 100)}%
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Suggested Recipes */}
                {suggestedRecipes.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Suggested Recipes</Text>
                    {suggestedRecipes.map((recipe) => (
                      <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
                        <View style={styles.recipeHeader}>
                          <View style={styles.recipeInfo}>
                            <Text style={styles.recipeName}>{recipe.name}</Text>
                            <Text style={styles.recipeDescription}>{recipe.description}</Text>
                          </View>
                          <View style={styles.matchBadge}>
                            <Text style={styles.matchPercentage}>{recipe.matchPercentage}%</Text>
                            <Text style={styles.matchLabel}>match</Text>
                          </View>
                        </View>

                        <View style={styles.recipeMetadata}>
                          <View style={styles.metadataItem}>
                            <Ionicons name="time-outline" size={14} color={Colors.light.textSecondary} />
                            <Text style={styles.metadataText}>{recipe.cookingTime} min</Text>
                          </View>
                          <View style={styles.metadataItem}>
                            <Ionicons name="bar-chart-outline" size={14} color={Colors.light.textSecondary} />
                            <Text style={styles.metadataText}>{recipe.difficulty}</Text>
                          </View>
                        </View>

                        {recipe.missingIngredients.length > 0 && (
                          <View style={styles.missingIngredientsContainer}>
                            <Text style={styles.missingIngredientsTitle}>Missing ingredients:</Text>
                            <Text style={styles.missingIngredients}>
                              {recipe.missingIngredients.join(', ')}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.xl,
  },
  permissionTitle: {
    fontSize: ThemeConfig.fontSize.xl,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginTop: ThemeConfig.spacing.lg,
    marginBottom: ThemeConfig.spacing.sm,
  },
  permissionText: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: ThemeConfig.spacing.xl,
  },
  permissionButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: ThemeConfig.spacing.xl,
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.large,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.semibold,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingTop: 60,
    paddingBottom: ThemeConfig.spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTitle: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    position: 'absolute',
    top: height * 0.2,
    left: width * 0.1,
    width: width * 0.8,
    height: width * 0.8,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: ThemeConfig.borderRadius.large,
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 60,
    paddingHorizontal: ThemeConfig.spacing.xl,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.lg,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
  },
  placeholder: {
    width: 50,
  },
  instructionText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.sm,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: ThemeConfig.spacing.sm,
    paddingHorizontal: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: ThemeConfig.fontSize.xxl,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: Colors.light.textPrimary,
  },
  helpButton: {
    padding: ThemeConfig.spacing.sm,
  },
  introContainer: {
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.xl,
    paddingVertical: ThemeConfig.spacing.xxl,
  },
  scannerIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.xl,
  },
  introTitle: {
    fontSize: ThemeConfig.fontSize.xxl,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: Colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: ThemeConfig.spacing.md,
  },
  introDescription: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: ThemeConfig.spacing.xl,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: ThemeConfig.spacing.xxl,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textPrimary,
    marginTop: ThemeConfig.spacing.sm,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  actionButtons: {
    width: '100%',
    gap: ThemeConfig.spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.large,
    ...ThemeConfig.shadows.medium,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    marginLeft: ThemeConfig.spacing.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.secondary,
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.large,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  secondaryButtonText: {
    color: Colors.light.primary,
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    marginLeft: ThemeConfig.spacing.sm,
  },
  resultsContainer: {
    paddingHorizontal: ThemeConfig.spacing.lg,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: ThemeConfig.spacing.xl,
  },
  scannedImage: {
    width: '100%',
    height: 200,
    borderRadius: ThemeConfig.borderRadius.medium,
  },
  retakeButton: {
    position: 'absolute',
    top: ThemeConfig.spacing.sm,
    right: ThemeConfig.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: ThemeConfig.spacing.sm,
    paddingVertical: ThemeConfig.spacing.xs,
    borderRadius: ThemeConfig.borderRadius.medium,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.sm,
    marginLeft: ThemeConfig.spacing.xs,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: ThemeConfig.spacing.xxl,
  },
  processingText: {
    fontSize: ThemeConfig.fontSize.lg,
    color: Colors.light.textSecondary,
  },
  section: {
    marginBottom: ThemeConfig.spacing.xl,
  },
  sectionTitle: {
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.md,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ThemeConfig.spacing.sm,
  },
  ingredientChip: {
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.sm,
    borderRadius: ThemeConfig.borderRadius.large,
    alignItems: 'center',
  },
  ingredientName: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textPrimary,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  ingredientConfidence: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.primary,
    marginTop: 2,
  },
  recipeCard: {
    backgroundColor: Colors.light.card,
    borderRadius: ThemeConfig.borderRadius.medium,
    padding: ThemeConfig.spacing.md,
    marginBottom: ThemeConfig.spacing.md,
    ...ThemeConfig.shadows.small,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ThemeConfig.spacing.sm,
  },
  recipeInfo: {
    flex: 1,
    marginRight: ThemeConfig.spacing.md,
  },
  recipeName: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.xs,
  },
  recipeDescription: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  matchBadge: {
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: ThemeConfig.spacing.sm,
    paddingVertical: ThemeConfig.spacing.xs,
    borderRadius: ThemeConfig.borderRadius.medium,
  },
  matchPercentage: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.sm,
    fontWeight: ThemeConfig.fontWeight.bold,
  },
  matchLabel: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.xs,
  },
  recipeMetadata: {
    flexDirection: 'row',
    gap: ThemeConfig.spacing.md,
    marginBottom: ThemeConfig.spacing.sm,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  missingIngredientsContainer: {
    backgroundColor: Colors.light.surface,
    padding: ThemeConfig.spacing.sm,
    borderRadius: ThemeConfig.borderRadius.small,
  },
  missingIngredientsTitle: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  missingIngredients: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textPrimary,
  },
}); 