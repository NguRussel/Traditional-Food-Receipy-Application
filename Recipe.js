import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  
  Dimensions,

  TextInput
  Alert,
  Modal,
  Share,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

// Mock Recipe Data
const mockRecipe = {
  id: 1,
  title: 'Creamy Pasta Carbonara',
  image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  chef: 'Marco Romano',
  chefImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  rating: 4.8,
  reviewCount: 324,
  cookTime: '25 min',
  servings: 4,
  difficulty: 'Medium',
  calories: 520,
  description: 'A classic Italian pasta dish with crispy pancetta, eggs, and parmesan cheese. This authentic carbonara recipe creates a silky, creamy sauce without using cream.',
  ingredients: [
    { id: 1, name: 'Spaghetti pasta', amount: '400g', checked: false, category: 'Pasta' },
    { id: 2, name: 'Pancetta or bacon', amount: '150g', checked: false, category: 'Meat' },
    { id: 3, name: 'Large eggs', amount: '3', checked: false, category: 'Dairy' },
    { id: 4, name: 'Parmesan cheese (grated)', amount: '100g', checked: false, category: 'Dairy' },
    { id: 5, name: 'Black pepper', amount: '1 tsp', checked: false, category: 'Spices' },
    { id: 6, name: 'Salt', amount: '1 tsp', checked: false, category: 'Spices' },
    { id: 7, name: 'Garlic cloves', amount: '2', checked: false, category: 'Vegetables' },
    { id: 8, name: 'Olive oil', amount: '2 tbsp', checked: false, category: 'Oil' },
  ],
  instructions: [
    {
      id: 1,
      step: 'Prepare the pasta water',
      description: 'Bring a large pot of salted water to boil. Add plenty of salt - the water should taste like seawater.',
      duration: '5 min',
      image: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400',
      completed: false,
    },
    {
      id: 2,
      step: 'Cook the pancetta',
      description: 'In a large skillet, cook pancetta over medium heat until crispy and golden. Remove excess fat but keep some for flavor.',
      duration: '8 min',
      image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400',
      completed: false,
    },
    {
      id: 3,
      step: 'Prepare the egg mixture',
      description: 'In a bowl, whisk together eggs, grated parmesan, and black pepper. This will create the creamy sauce.',
      duration: '3 min',
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
      completed: false,
    },
    {
      id: 4,
      step: 'Cook the pasta',
      description: 'Add spaghetti to boiling water and cook according to package directions until al dente. Reserve 1 cup pasta water.',
      duration: '10 min',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
      completed: false,
    },
    {
      id: 5,
      step: 'Combine everything',
      description: 'Add hot pasta to the pancetta pan, then quickly mix in the egg mixture off the heat. Add pasta water as needed.',
      duration: '3 min',
      image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400',
      completed: false,
    },
  ],
  nutrition: {
    calories: 520,
    protein: 28,
    carbs: 45,
    fat: 25,
    fiber: 3,
  },
  tags: ['Italian', 'Pasta', 'Quick', 'Comfort Food'],
};

const mockReviews = [
  {
    id: 1,
    user: 'Sarah Johnson',
    userImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
    rating: 5,
    date: '2024-05-15',
    comment: 'Perfect carbonara! The instructions were clear and easy to follow. My family loved it!',
    helpful: 23,
    images: ['https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300'],
  },
  {
    id: 2,
    user: 'Mike Chen',
    userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    rating: 4,
    date: '2024-05-10',
    comment: 'Great recipe! I added some peas for extra color and nutrition. Turned out delicious.',
    helpful: 15,
    images: [],
  },
  {
    id: 3,
    user: 'Emma Wilson',
    userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    rating: 5,
    date: '2024-05-08',
    comment: 'This is now my go-to carbonara recipe. The video tutorial was super helpful!',
    helpful: 31,
    images: [],
  },
];

// 1. RECIPE DETAIL SCREEN
export function RecipeDetailScreen({ navigation, route }) {
  const { recipe = mockRecipe } = route?.params || {};
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing recipe: ${recipe.title}`,
        title: recipe.title,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.description}>{recipe.description}</Text>
            
            <View style={styles.nutritionContainer}>
              <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutrition.calories}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutrition.protein}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutrition.carbs}g</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutrition.fat}g</Text>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsRow}>
                {recipe.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );
      case 'ingredients':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Ingredients ({recipe.servings} servings)</Text>
            {recipe.ingredients.map((ingredient) => (
              <View key={ingredient.id} style={styles.ingredientItem}>
                <View style={styles.ingredientInfo}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <Text style={styles.ingredientAmount}>{ingredient.amount}</Text>
                </View>
                <Text style={styles.ingredientCategory}>{ingredient.category}</Text>
              </View>
            ))}
          </View>
        );
      case 'instructions':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((instruction, index) => (
              <View key={instruction.id} style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>{instruction.step}</Text>
                  <Text style={styles.instructionDescription}>{instruction.description}</Text>
                  <Text style={styles.instructionDuration}>⏱️ {instruction.duration}</Text>
                </View>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Image */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: recipe.image }} style={styles.headerImage} />
        <View style={styles.headerOverlay}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation?.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorite ? "#FF6B6B" : "white"}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Play Video Button */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => navigation?.navigate('VideoPlayerScreen', { videoUrl: recipe.videoUrl, title: recipe.title })}
          >
            <Ionicons name="play" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recipe Info */}
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
        
        <View style={styles.chefInfo}>
          <Image source={{ uri: recipe.chefImage }} style={styles.chefImage} />
          <View style={styles.chefDetails}>
            <Text style={styles.chefName}>by {recipe.chef}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{recipe.rating}</Text>
              <Text style={styles.reviewCount}>({recipe.reviewCount} reviews)</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.statText}>{recipe.cookTime}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={20} color="#666" />
            <Text style={styles.statText}>{recipe.servings} servings</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="bar-chart-outline" size={20} color="#666" />
            <Text style={styles.statText}>{recipe.difficulty}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { flex: 1 }]}
            onPress={() => navigation?.navigate('CookingModeScreen', { recipe })}
          >
            <Ionicons name="restaurant-outline" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Start Cooking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { marginLeft: 12 }]}
            onPress={() => navigation?.navigate('IngredientsScreen', { ingredients: recipe.ingredients })}
          >
            <Ionicons name="list-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['overview', 'ingredients', 'instructions'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}

        {/* Reviews Section */}
        <TouchableOpacity
          style={styles.reviewsButton}
          onPress={() => navigation?.navigate('ReviewsScreen', { recipe })}
        >
          <View style={styles.reviewsInfo}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.reviewsText}>
              {recipe.rating} • {recipe.reviewCount} Reviews
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// 2. VIDEO PLAYER SCREEN
export function VideoPlayerScreen({ navigation, route }) {
  const { videoUrl, title } = route?.params || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [showControls]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.videoContainer}>
      <StatusBar hidden />
      
      {/* Video Player */}
      <TouchableOpacity
        style={styles.videoPlayer}
        onPress={() => setShowControls(!showControls)}
        activeOpacity={1}
      >
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800' }}
          style={styles.videoThumbnail}
        />
        
        {/* Video Controls Overlay */}
        {showControls && (
          <View style={styles.videoControls}>
            <View style={styles.topControls}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation?.goBack()}
              >
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.videoTitle}>{title}</Text>
            </View>

            <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={48}
                color="white"
              />
            </TouchableOpacity>

            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(currentTime / duration) * 100}%` }
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Video Info */}
      <View style={styles.videoInfo}>
        <Text style={styles.videoInfoTitle}>{title}</Text>
        <Text style={styles.videoDescription}>
          Follow along with this step-by-step video tutorial to master this recipe.
        </Text>
        
        <View style={styles.videoActions}>
          <TouchableOpacity style={styles.videoActionButton}>
            <Ionicons name="thumbs-up-outline" size={24} color="#666" />
            <Text style={styles.videoActionText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.videoActionButton}>
            <Ionicons name="share-outline" size={24} color="#666" />
            <Text style={styles.videoActionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.videoActionButton}>
            <Ionicons name="bookmark-outline" size={24} color="#666" />
            <Text style={styles.videoActionText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// 3. INGREDIENTS SCREEN
export function IngredientsScreen({ navigation, route }) {
  const { ingredients: initialIngredients = mockRecipe.ingredients } = route?.params || {};
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [servings, setServings] = useState(4);

  const toggleIngredient = (id) => {
    setIngredients(prev =>
      prev.map(ingredient =>
        ingredient.id === id
          ? { ...ingredient, checked: !ingredient.checked }
          : ingredient
      )
    );
  };

  const adjustServings = (newServings) => {
    if (newServings < 1) return;
    setServings(newServings);
  };

  const generateShoppingList = () => {
    const uncheckedIngredients = ingredients.filter(item => !item.checked);
    if (uncheckedIngredients.length === 0) {
      Alert.alert('Shopping List', 'All ingredients are already checked off!');
      return;
    }
    
    Alert.alert(
      'Shopping List Generated',
      `Added ${uncheckedIngredients.length} items to your shopping list.`
    );
  };

  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    const category = ingredient.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(ingredient);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.screenHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Ingredients</Text>
        <TouchableOpacity onPress={generateShoppingList}>
          <Ionicons name="bag-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Servings Adjuster */}
      <View style={styles.servingsContainer}>
        <Text style={styles.servingsLabel}>Servings</Text>
        <View style={styles.servingsControls}>
          <TouchableOpacity
            style={styles.servingsButton}
            onPress={() => adjustServings(servings - 1)}
          >
            <Ionicons name="remove" size={20} color="#FF6B6B" />
          </TouchableOpacity>
          <Text style={styles.servingsValue}>{servings}</Text>
          <TouchableOpacity
            style={styles.servingsButton}
            onPress={() => adjustServings(servings + 1)}
          >
            <Ionicons name="add" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ingredients List */}
      <ScrollView style={styles.ingredientsList} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedIngredients).map(([category, items]) => (
          <View key={category} style={styles.ingredientCategory}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {items.map((ingredient) => (
              <TouchableOpacity
                key={ingredient.id}
                style={styles.ingredientRow}
                onPress={() => toggleIngredient(ingredient.id)}
              >
                <View style={styles.checkboxContainer}>
                  <View style={[
                    styles.checkbox,
                    ingredient.checked && styles.checkedCheckbox
                  ]}>
                    {ingredient.checked && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </View>
                <View style={styles.ingredientDetails}>
                  <Text style={[
                    styles.ingredientName,
                    ingredient.checked && styles.checkedText
                  ]}>
                    {ingredient.name}
                  </Text>
                  <Text style={[
                    styles.ingredientAmount,
                    ingredient.checked && styles.checkedText
                  ]}>
                    {ingredient.amount}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={generateShoppingList}
        >
          <Ionicons name="bag-outline" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Add to Shopping List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 4. COOKING MODE SCREEN
export function CookingModeScreen({ navigation, route }) {
  const { recipe = mockRecipe } = route?.params || {};
  const [currentStep, setCurrentStep] = useState(0);
  const [instructions, setInstructions] = useState(recipe.instructions);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = (minutes) => {
    setTimer(minutes * 60);
    setShowTimer(true);
    setIsTimerRunning(true);
    
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          Alert.alert('Timer', 'Time\'s up!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

const resetTimer = () => {
      stopTimer();
    setTimer(0);
    setShowTimer(false);
};
const markStepComplete = () => {
    setInstructions(prev =>
      prev.map((instruction, index) =>
        index === currentStep
          ? { ...instruction, completed: true }
          : instruction
      )
    );
    
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNextStep = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentInstruction = instructions[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.cookingHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Cooking Mode</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{currentStep + 1}/{instructions.length}</Text>
        </View>
      </View>

      {/* Timer */}
      {showTimer && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
          <View style={styles.timerControls}>
            <TouchableOpacity
              style={styles.timerButton}
              onPress={isTimerRunning ? stopTimer : () => startTimer(Math.floor(timer / 60))}
            >
              <Ionicons
                name={isTimerRunning ? "pause" : "play"}
                size={16}
                color="#FF6B6B"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.timerButton} onPress={resetTimer}>
              <Ionicons name="refresh" size={16} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step Content */}
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: currentInstruction.image }}
          style={styles.stepImage}
        />
        
        <View style={styles.stepInfo}>
          <Text style={styles.stepTitle}>{currentInstruction.step}</Text>
          <Text style={styles.stepDescription}>{currentInstruction.description}</Text>
          
          <View style={styles.stepMeta}>
            <View style={styles.stepDuration}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.stepDurationText}>{currentInstruction.duration}</Text>
            </View>
            <TouchableOpacity
              style={styles.startTimerButton}
              onPress={() => startTimer(parseInt(currentInstruction.duration))}
            >
              <Ionicons name="timer-outline" size={16} color="#FF6B6B" />
              <Text style={styles.startTimerText}>Start Timer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Step Navigation */}
      <View style={styles.stepNavigation}>
        <TouchableOpacity
          style={[styles.navButton, currentStep === 0 && styles.disabledButton]}
          onPress={goToPreviousStep}
          disabled={currentStep === 0}
        >
          <Ionicons name="chevron-back" size={24} color={currentStep === 0 ? "#ccc" : "#333"} />
          <Text style={[styles.navButtonText, currentStep === 0 && styles.disabledText]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={markStepComplete}
        >
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.completeButtonText}>Complete Step</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentStep === instructions.length - 1 ? styles.disabledButton : styles.navButton
          ]}
          onPress={goToNextStep}
          disabled={currentStep === instructions.length - 1}
        >
          <Text style={[
            styles.navButtonText,
            currentStep === instructions.length - 1 && styles.disabledText
          ]}>
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={currentStep === instructions.length - 1 ? "#ccc" : "#333"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}