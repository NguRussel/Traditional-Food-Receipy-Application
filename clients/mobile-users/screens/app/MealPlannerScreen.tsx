import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, ThemeConfig } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import Toast from 'react-native-toast-message';

interface Recipe {
  id: string;
  name: string;
  description: string;
  cookingTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  image?: string;
  ingredients: string[];
}

interface MealPlan {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

interface DayMeal {
  date: Date;
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
  snacks?: Recipe[];
}

const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Ndolé',
    description: 'Traditional Cameroonian stew with peanuts and bitter leaves',
    cookingTime: 90,
    difficulty: 'Medium',
    category: 'Lunch',
    ingredients: ['Bitter leaves', 'Peanuts', 'Fish', 'Beef', 'Crayfish'],
  },
  {
    id: '2',
    name: 'Achu Soup',
    description: 'Yellow soup from Northwest Cameroon',
    cookingTime: 60,
    difficulty: 'Medium',
    category: 'Dinner',
    ingredients: ['Palm nuts', 'Fish', 'Meat', 'Spinach', 'Okra'],
  },
  {
    id: '3',
    name: 'Poulet DG',
    description: 'Chicken with plantains and vegetables',
    cookingTime: 45,
    difficulty: 'Easy',
    category: 'Dinner',
    ingredients: ['Chicken', 'Plantains', 'Carrots', 'Green beans'],
  },
  {
    id: '4',
    name: 'Koki Beans',
    description: 'Steamed black-eyed pea cake',
    cookingTime: 30,
    difficulty: 'Easy',
    category: 'Breakfast',
    ingredients: ['Black-eyed peas', 'Palm oil', 'Onions', 'Ginger'],
  },
  {
    id: '5',
    name: 'Plantain Chips',
    description: 'Crispy fried plantain slices',
    cookingTime: 20,
    difficulty: 'Easy',
    category: 'Snack',
    ingredients: ['Plantains', 'Palm oil', 'Salt'],
  },
  {
    id: '6',
    name: 'Jollof Rice',
    description: 'Spiced rice with tomatoes and vegetables',
    cookingTime: 40,
    difficulty: 'Medium',
    category: 'Lunch',
    ingredients: ['Rice', 'Tomatoes', 'Onions', 'Pepper', 'Stock'],
  },
];

const mockMealPlans: MealPlan[] = [
  {
    id: '1',
    name: 'Traditional Week',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: '2',
    name: 'Quick Meals',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    isActive: false,
  },
];

export default function MealPlannerScreen() {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan>(mockMealPlans[0]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>(mockMealPlans);
  const [weekMeals, setWeekMeals] = useState<DayMeal[]>([]);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  } | null>(null);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [showShoppingList, setShowShoppingList] = useState(false);

  // Initialize week meals
  React.useEffect(() => {
    generateWeekMeals();
  }, [currentWeekStart]);

  const generateWeekMeals = () => {
    const days: DayMeal[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      days.push({
        date,
        breakfast: i === 0 ? mockRecipes[3] : undefined, // Koki Beans on Monday
        lunch: i === 1 ? mockRecipes[0] : i === 3 ? mockRecipes[5] : undefined, // Ndolé on Tuesday, Jollof on Thursday
        dinner: i === 2 ? mockRecipes[1] : i === 4 ? mockRecipes[2] : undefined, // Achu on Wednesday, Poulet DG on Friday
        snacks: i === 6 ? [mockRecipes[4]] : undefined, // Plantain chips on Sunday
      });
    }
    setWeekMeals(days);
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDateNumber = (date: Date) => {
    return date.getDate();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const selectRecipeForSlot = (recipe: Recipe) => {
    if (!selectedSlot) return;

    setWeekMeals(prevMeals => 
      prevMeals.map(dayMeal => {
        if (dayMeal.date.toDateString() === selectedSlot.date.toDateString()) {
          if (selectedSlot.mealType === 'snacks') {
            return {
              ...dayMeal,
              snacks: [...(dayMeal.snacks || []), recipe],
            };
          } else {
            return {
              ...dayMeal,
              [selectedSlot.mealType]: recipe,
            };
          }
        }
        return dayMeal;
      })
    );

    setShowRecipeSelector(false);
    setSelectedSlot(null);
    Toast.show({
      type: 'success',
      text1: 'Recipe Added',
      text2: `${recipe.name} added to your meal plan`,
    });
  };

  const removeRecipeFromSlot = (date: Date, mealType: string, recipe?: Recipe) => {
    setWeekMeals(prevMeals =>
      prevMeals.map(dayMeal => {
        if (dayMeal.date.toDateString() === date.toDateString()) {
          if (mealType === 'snacks' && recipe) {
            return {
              ...dayMeal,
              snacks: dayMeal.snacks?.filter(s => s.id !== recipe.id) || [],
            };
          } else {
            return {
              ...dayMeal,
              [mealType]: undefined,
            };
          }
        }
        return dayMeal;
      })
    );
  };

  const createNewMealPlan = () => {
    if (!newPlanName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Plan name required',
        text2: 'Please enter a name for your meal plan',
      });
      return;
    }

    const newPlan: MealPlan = {
      id: Date.now().toString(),
      name: newPlanName.trim(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: false,
    };

    setMealPlans(prev => [...prev, newPlan]);
    setNewPlanName('');
    setShowCreatePlan(false);
    Toast.show({
      type: 'success',
      text1: 'Meal plan created',
      text2: `${newPlan.name} has been created successfully`,
    });
  };

  const generateShoppingList = () => {
    const ingredients: { [key: string]: number } = {};
    
    weekMeals.forEach(dayMeal => {
      [dayMeal.breakfast, dayMeal.lunch, dayMeal.dinner, ...(dayMeal.snacks || [])]
        .filter(Boolean)
        .forEach(recipe => {
          recipe!.ingredients.forEach(ingredient => {
            ingredients[ingredient] = (ingredients[ingredient] || 0) + 1;
          });
        });
    });

    return Object.entries(ingredients).map(([ingredient, count]) => ({
      ingredient,
      count,
    }));
  };

  const openRecipeSelector = (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    setSelectedSlot({ date, mealType });
    setShowRecipeSelector(true);
  };

  const renderMealSlot = (dayMeal: DayMeal, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    const recipe = dayMeal[mealType];
    const mealIcons = {
      breakfast: 'sunny-outline',
      lunch: 'restaurant-outline',
      dinner: 'moon-outline',
    };

    return (
      <TouchableOpacity
        style={[styles.mealSlot, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => openRecipeSelector(dayMeal.date, mealType)}
      >
        {recipe ? (
          <View style={styles.mealContent}>
            <View style={styles.mealHeader}>
              <Ionicons name={mealIcons[mealType] as any} size={16} color={colors.primary} />
              <Text style={[styles.mealTime, { color: colors.textSecondary }]}>
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </Text>
              <TouchableOpacity
                onPress={() => removeRecipeFromSlot(dayMeal.date, mealType)}
                style={styles.removeButton}
              >
                <Ionicons name="close" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.recipeName, { color: colors.textPrimary }]} numberOfLines={2}>
              {recipe.name}
            </Text>
            <View style={styles.recipeInfo}>
              <Text style={[styles.recipeTime, { color: colors.textSecondary }]}>
                {recipe.cookingTime}m
              </Text>
              <View style={[styles.difficultyBadge, styles[`difficulty${recipe.difficulty}`]]}>
                <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyMealSlot}>
            <Ionicons name={mealIcons[mealType] as any} size={20} color={colors.textMuted} />
            <Text style={[styles.addMealText, { color: colors.textMuted }]}>
              Add {mealType}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSnacksSlot = (dayMeal: DayMeal) => {
    return (
      <TouchableOpacity
        style={[styles.snacksSlot, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => openRecipeSelector(dayMeal.date, 'snacks')}
      >
        <View style={styles.snacksHeader}>
          <Ionicons name="fast-food-outline" size={16} color={colors.primary} />
          <Text style={[styles.mealTime, { color: colors.textSecondary }]}>Snacks</Text>
        </View>
        {dayMeal.snacks && dayMeal.snacks.length > 0 ? (
          <View style={styles.snacksList}>
            {dayMeal.snacks.map((snack, index) => (
              <View key={index} style={styles.snackItem}>
                <Text style={[styles.snackName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {snack.name}
                </Text>
                <TouchableOpacity
                  onPress={() => removeRecipeFromSlot(dayMeal.date, 'snacks', snack)}
                  style={styles.removeSnackButton}
                >
                  <Ionicons name="close" size={12} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.addMealText, { color: colors.textMuted }]}>
            Add snacks
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderDayColumn = ({ item: dayMeal }: { item: DayMeal }) => (
    <View style={styles.dayColumn}>
      {/* Day Header */}
      <View style={[styles.dayHeader, { backgroundColor: colors.surface }]}>
        <Text style={[styles.dayName, { color: colors.textPrimary }]}>
          {getDayName(dayMeal.date)}
        </Text>
        <Text style={[styles.dayNumber, { color: colors.primary }]}>
          {getDateNumber(dayMeal.date)}
        </Text>
      </View>

      {/* Meals */}
      <View style={styles.mealsContainer}>
        {renderMealSlot(dayMeal, 'breakfast')}
        {renderMealSlot(dayMeal, 'lunch')}
        {renderMealSlot(dayMeal, 'dinner')}
        {renderSnacksSlot(dayMeal)}
      </View>
    </View>
  );

  const renderRecipeItem = ({ item: recipe }: { item: Recipe }) => (
    <TouchableOpacity
      style={[styles.recipeItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => selectRecipeForSlot(recipe)}
    >
      <View style={styles.recipeItemContent}>
        <Text style={[styles.recipeItemName, { color: colors.textPrimary }]}>{recipe.name}</Text>
        <Text style={[styles.recipeItemDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {recipe.description}
        </Text>
        <View style={styles.recipeItemInfo}>
          <Text style={[styles.recipeItemTime, { color: colors.textSecondary }]}>
            {recipe.cookingTime}m
          </Text>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.categoryText}>{recipe.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Meal Planner</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Plan your Cameroonian meals
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowShoppingList(true)}
          >
            <Ionicons name="list-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowCreatePlan(true)}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Week Navigation */}
      <View style={[styles.weekNavigation, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.weekNavButton}
          onPress={() => navigateWeek('prev')}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={[styles.weekRange, { color: colors.textPrimary }]}>
          {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
          {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
        
        <TouchableOpacity
          style={styles.weekNavButton}
          onPress={() => navigateWeek('next')}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Meal Plan Grid */}
      <FlatList
        data={weekMeals}
        renderItem={renderDayColumn}
        keyExtractor={(item) => item.date.toISOString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mealGrid}
      />

      {/* Recipe Selector Modal */}
      <Modal
        visible={showRecipeSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowRecipeSelector(false)}>
              <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Select Recipe
            </Text>
            <View style={styles.modalSpacer} />
          </View>

          <FlatList
            data={mockRecipes.filter(recipe => 
              !selectedSlot?.mealType || 
              selectedSlot.mealType === 'snacks' || 
              recipe.category.toLowerCase() === selectedSlot.mealType
            )}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id}
            style={styles.recipeList}
            contentContainerStyle={styles.recipeListContent}
          />
        </SafeAreaView>
      </Modal>

      {/* Create Plan Modal */}
      <Modal
        visible={showCreatePlan}
        animationType="slide"
        presentationStyle="formSheet"
        transparent
      >
        <View style={styles.overlay}>
          <View style={[styles.createPlanModal, { backgroundColor: colors.card }]}>
            <Text style={[styles.createPlanTitle, { color: colors.textPrimary }]}>
              Create New Meal Plan
            </Text>
            
            <TextInput
              style={[styles.planNameInput, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.textPrimary 
              }]}
              placeholder="Meal plan name"
              placeholderTextColor={colors.textMuted}
              value={newPlanName}
              onChangeText={setNewPlanName}
              maxLength={50}
            />
            
            <View style={styles.createPlanButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.surface }]}
                onPress={() => {
                  setShowCreatePlan(false);
                  setNewPlanName('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.primary }]}
                onPress={createNewMealPlan}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Shopping List Modal */}
      <Modal
        visible={showShoppingList}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowShoppingList(false)}>
              <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Shopping List
            </Text>
            <TouchableOpacity>
              <Ionicons name="share-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.shoppingList}>
            <Text style={[styles.shoppingListSubtitle, { color: colors.textSecondary }]}>
              Ingredients needed for this week
            </Text>
            
            {generateShoppingList().map((item, index) => (
              <View key={index} style={[styles.shoppingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.ingredientName, { color: colors.textPrimary }]}>
                  {item.ingredient}
                </Text>
                <Text style={[styles.ingredientCount, { color: colors.textSecondary }]}>
                  {item.count} recipe{item.count > 1 ? 's' : ''}
                </Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: ThemeConfig.fontSize.xxl,
    fontWeight: ThemeConfig.fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: ThemeConfig.fontSize.sm,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: ThemeConfig.spacing.sm,
    marginLeft: ThemeConfig.spacing.sm,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
  },
  weekNavButton: {
    padding: ThemeConfig.spacing.sm,
  },
  weekRange: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  mealGrid: {
    paddingHorizontal: ThemeConfig.spacing.md,
  },
  dayColumn: {
    width: 160,
    marginHorizontal: ThemeConfig.spacing.xs,
  },
  dayHeader: {
    alignItems: 'center',
    paddingVertical: ThemeConfig.spacing.sm,
    borderRadius: ThemeConfig.borderRadius.medium,
    marginBottom: ThemeConfig.spacing.sm,
  },
  dayName: {
    fontSize: ThemeConfig.fontSize.sm,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  dayNumber: {
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.bold,
  },
  mealsContainer: {
    gap: ThemeConfig.spacing.sm,
  },
  mealSlot: {
    borderRadius: ThemeConfig.borderRadius.medium,
    padding: ThemeConfig.spacing.sm,
    minHeight: 80,
    borderWidth: 1,
    ...ThemeConfig.shadows.small,
  },
  mealContent: {
    flex: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.xs,
  },
  mealTime: {
    fontSize: ThemeConfig.fontSize.xs,
    fontWeight: ThemeConfig.fontWeight.medium,
    marginLeft: ThemeConfig.spacing.xs,
    flex: 1,
  },
  removeButton: {
    padding: 2,
  },
  recipeName: {
    fontSize: ThemeConfig.fontSize.sm,
    fontWeight: ThemeConfig.fontWeight.medium,
    marginBottom: ThemeConfig.spacing.xs,
  },
  recipeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeTime: {
    fontSize: ThemeConfig.fontSize.xs,
  },
  difficultyBadge: {
    paddingHorizontal: ThemeConfig.spacing.xs,
    paddingVertical: 2,
    borderRadius: ThemeConfig.borderRadius.small,
  },
  difficultyEasy: {
    backgroundColor: '#4CAF50',
  },
  difficultyMedium: {
    backgroundColor: '#FF9800',
  },
  difficultyHard: {
    backgroundColor: '#F44336',
  },
  difficultyText: {
    fontSize: ThemeConfig.fontSize.xs,
    color: 'white',
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  emptyMealSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMealText: {
    fontSize: ThemeConfig.fontSize.xs,
    marginTop: ThemeConfig.spacing.xs,
  },
  snacksSlot: {
    borderRadius: ThemeConfig.borderRadius.medium,
    padding: ThemeConfig.spacing.sm,
    minHeight: 60,
    borderWidth: 1,
    ...ThemeConfig.shadows.small,
  },
  snacksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.xs,
  },
  snacksList: {
    gap: ThemeConfig.spacing.xs,
  },
  snackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  snackName: {
    fontSize: ThemeConfig.fontSize.xs,
    flex: 1,
  },
  removeSnackButton: {
    padding: 2,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    borderBottomWidth: 1,
  },
  modalCancelText: {
    fontSize: ThemeConfig.fontSize.md,
  },
  modalTitle: {
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
  },
  modalSpacer: {
    width: 60,
  },
  recipeList: {
    flex: 1,
  },
  recipeListContent: {
    padding: ThemeConfig.spacing.lg,
  },
  recipeItem: {
    borderRadius: ThemeConfig.borderRadius.medium,
    padding: ThemeConfig.spacing.md,
    marginBottom: ThemeConfig.spacing.md,
    borderWidth: 1,
    ...ThemeConfig.shadows.small,
  },
  recipeItemContent: {
    flex: 1,
  },
  recipeItemName: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.semibold,
    marginBottom: ThemeConfig.spacing.xs,
  },
  recipeItemDescription: {
    fontSize: ThemeConfig.fontSize.sm,
    marginBottom: ThemeConfig.spacing.sm,
    lineHeight: 18,
  },
  recipeItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeItemTime: {
    fontSize: ThemeConfig.fontSize.sm,
  },
  categoryBadge: {
    paddingHorizontal: ThemeConfig.spacing.sm,
    paddingVertical: ThemeConfig.spacing.xs,
    borderRadius: ThemeConfig.borderRadius.medium,
  },
  categoryText: {
    fontSize: ThemeConfig.fontSize.xs,
    color: 'white',
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPlanModal: {
    margin: ThemeConfig.spacing.xl,
    borderRadius: ThemeConfig.borderRadius.large,
    padding: ThemeConfig.spacing.xl,
    width: '80%',
  },
  createPlanTitle: {
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    marginBottom: ThemeConfig.spacing.lg,
    textAlign: 'center',
  },
  planNameInput: {
    borderWidth: 1,
    borderRadius: ThemeConfig.borderRadius.medium,
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.md,
    fontSize: ThemeConfig.fontSize.md,
    marginBottom: ThemeConfig.spacing.lg,
  },
  createPlanButtons: {
    flexDirection: 'row',
    gap: ThemeConfig.spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.medium,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  createButton: {
    flex: 1,
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.medium,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: 'white',
  },
  shoppingList: {
    flex: 1,
    paddingHorizontal: ThemeConfig.spacing.lg,
  },
  shoppingListSubtitle: {
    fontSize: ThemeConfig.fontSize.sm,
    marginBottom: ThemeConfig.spacing.lg,
    textAlign: 'center',
  },
  shoppingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.medium,
    marginBottom: ThemeConfig.spacing.sm,
    borderWidth: 1,
    ...ThemeConfig.shadows.small,
  },
  ingredientName: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  ingredientCount: {
    fontSize: ThemeConfig.fontSize.sm,
  },
}); 