import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ThemeConfig } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

// Mock data - in real app, this would come from your backend
const categories = [
  { id: '1', name: 'Breakfast', icon: 'sunny-outline', color: '#FFE135' },
  { id: '2', name: 'Lunch', icon: 'restaurant-outline', color: '#FF6B35' },
  { id: '3', name: 'Dinner', icon: 'moon-outline', color: '#3D7BFF' },
  { id: '4', name: 'Dessert', icon: 'ice-cream-outline', color: '#BF5AF2' },
];

const popularRecipes = [
  {
    id: '1',
    name: 'Ndolé',
    description: 'Traditional Cameroonian stew with peanuts and bitter leaves',
    image: 'https://via.placeholder.com/300x200',
    rating: 4.8,
    cookingTime: 45,
    difficulty: 'Medium',
    region: 'Centre',
    chef: 'Mama Rose',
  },
  {
    id: '2',
    name: 'Achu Soup',
    description: 'Yellow soup from the Northwest region',
    image: 'https://via.placeholder.com/300x200',
    rating: 4.6,
    cookingTime: 60,
    difficulty: 'Hard',
    region: 'Northwest',
    chef: 'Chef Paul',
  },
  {
    id: '3',
    name: 'Poulet DG',
    description: 'Chicken with plantains and vegetables',
    image: 'https://via.placeholder.com/300x200',
    rating: 4.9,
    cookingTime: 30,
    difficulty: 'Easy',
    region: 'Littoral',
    chef: 'Chef Marie',
  },
];

const topChefs = [
  { id: '1', name: 'Mama Rose', avatar: 'https://via.placeholder.com/80x80', specialization: 'Traditional Cuisine', followers: 1200 },
  { id: '2', name: 'Chef Paul', avatar: 'https://via.placeholder.com/80x80', specialization: 'Regional Dishes', followers: 850 },
  { id: '3', name: 'Chef Marie', avatar: 'https://via.placeholder.com/80x80', specialization: 'Modern Fusion', followers: 920 },
  { id: '4', name: 'Papa Jean', avatar: 'https://via.placeholder.com/80x80', specialization: 'Grilled Specialties', followers: 650 },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity style={[styles.categoryCard, { backgroundColor: item.color }]}>
      <Ionicons name={item.icon as any} size={24} color="white" />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderRecipeCard = ({ item }: { item: typeof popularRecipes[0] }) => (
    <TouchableOpacity style={styles.recipeCard}>
      <View style={styles.recipeImageContainer}>
        <View style={styles.recipePlaceholder}>
          <Ionicons name="restaurant" size={40} color={Colors.light.textMuted} />
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.recipeMetadata}>
          <View style={styles.metadataItem}>
            <Ionicons name="time-outline" size={14} color={Colors.light.textSecondary} />
            <Text style={styles.metadataText}>{item.cookingTime} min</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="location-outline" size={14} color={Colors.light.textSecondary} />
            <Text style={styles.metadataText}>{item.region}</Text>
          </View>
        </View>
        
        <Text style={styles.chefName}>By {item.chef}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderChefItem = ({ item }: { item: typeof topChefs[0] }) => (
    <TouchableOpacity style={styles.chefCard}>
      <View style={styles.chefAvatarContainer}>
        <View style={styles.chefAvatar}>
          <Ionicons name="person" size={30} color={Colors.light.textMuted} />
        </View>
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark" size={10} color="white" />
        </View>
      </View>
      <Text style={styles.chefName}>{item.name}</Text>
      <Text style={styles.chefSpecialization} numberOfLines={1}>
        {item.specialization}
      </Text>
      <Text style={styles.chefFollowers}>{item.followers} followers</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.user_metadata?.full_name || 'Food Lover'}!</Text>
            <Text style={styles.subGreeting}>What would you like to cook today?</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.light.textPrimary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.light.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search any recipe...</Text>
          <Ionicons name="options-outline" size={20} color={Colors.light.textSecondary} />
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="scan-outline" size={20} color={Colors.light.primary} />
            <Text style={styles.quickActionText}>Scan Ingredients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="chatbubble-outline" size={20} color={Colors.light.primary} />
            <Text style={styles.quickActionText}>AI Assistant</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="heart-outline" size={20} color={Colors.light.primary} />
            <Text style={styles.quickActionText}>Favorites</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Popular Recipes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Recipes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={popularRecipes}
            renderItem={renderRecipeCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recipesList}
          />
        </View>

        {/* Top Chefs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Chefs</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={topChefs}
            renderItem={renderChefItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chefsList}
          />
        </View>

        {/* Recipe of the Week */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recipes Of The Week</Text>
          <TouchableOpacity style={styles.featuredRecipeCard}>
            <View style={styles.featuredImageContainer}>
              <View style={styles.featuredPlaceholder}>
                <Ionicons name="restaurant" size={60} color={Colors.light.textMuted} />
              </View>
              <View style={styles.playButton}>
                <Ionicons name="play" size={16} color="white" />
              </View>
            </View>
            
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredTitle}>Traditional Koki</Text>
              <Text style={styles.featuredDescription}>
                Learn to make authentic Koki with banana leaves
              </Text>
              <View style={styles.featuredMetadata}>
                <Text style={styles.featuredTime}>30 mins • Easy</Text>
                <Text style={styles.featuredChef}>By Chef Sarah</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
  },
  greeting: {
    fontSize: ThemeConfig.fontSize.xl,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
  },
  subGreeting: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: ThemeConfig.spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    marginHorizontal: ThemeConfig.spacing.lg,
    marginBottom: ThemeConfig.spacing.lg,
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textSecondary,
    marginLeft: ThemeConfig.spacing.sm,
  },
  section: {
    marginBottom: ThemeConfig.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    marginBottom: ThemeConfig.spacing.md,
  },
  sectionTitle: {
    fontSize: ThemeConfig.fontSize.xl,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
  },
  seeAllText: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  categoriesList: {
    paddingHorizontal: ThemeConfig.spacing.lg,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: ThemeConfig.borderRadius.medium,
    marginRight: ThemeConfig.spacing.md,
  },
  categoryText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.xs,
    fontWeight: ThemeConfig.fontWeight.medium,
    marginTop: ThemeConfig.spacing.xs,
  },
  recipesList: {
    paddingHorizontal: ThemeConfig.spacing.lg,
  },
  recipeCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.light.card,
    borderRadius: ThemeConfig.borderRadius.large,
    marginRight: ThemeConfig.spacing.md,
    ...ThemeConfig.shadows.medium,
  },
  recipeImageContainer: {
    position: 'relative',
  },
  recipePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: ThemeConfig.borderRadius.large,
    borderTopRightRadius: ThemeConfig.borderRadius.large,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: ThemeConfig.spacing.sm,
    right: ThemeConfig.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: ThemeConfig.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.xs,
    marginLeft: 2,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  recipeInfo: {
    padding: ThemeConfig.spacing.md,
  },
  recipeName: {
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.xs,
  },
  recipeDescription: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: ThemeConfig.spacing.sm,
    lineHeight: 18,
  },
  recipeMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  chefName: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.textMuted,
  },
  chefsList: {
    paddingHorizontal: ThemeConfig.spacing.lg,
  },
  chefCard: {
    alignItems: 'center',
    width: 100,
    marginRight: ThemeConfig.spacing.md,
  },
  chefAvatarContainer: {
    position: 'relative',
    marginBottom: ThemeConfig.spacing.sm,
  },
  chefAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  chefSpecialization: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  chefFollowers: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
  featuredRecipeCard: {
    backgroundColor: Colors.light.card,
    borderRadius: ThemeConfig.borderRadius.large,
    marginHorizontal: ThemeConfig.spacing.lg,
    ...ThemeConfig.shadows.medium,
  },
  featuredImageContainer: {
    position: 'relative',
  },
  featuredPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: ThemeConfig.borderRadius.large,
    borderTopRightRadius: ThemeConfig.borderRadius.large,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredInfo: {
    padding: ThemeConfig.spacing.md,
  },
  featuredTitle: {
    fontSize: ThemeConfig.fontSize.xl,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.xs,
  },
  featuredDescription: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textSecondary,
    marginBottom: ThemeConfig.spacing.sm,
  },
  featuredMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredTime: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  featuredChef: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ThemeConfig.spacing.lg,
    marginVertical: ThemeConfig.spacing.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.secondary,
    paddingVertical: ThemeConfig.spacing.sm,
    paddingHorizontal: ThemeConfig.spacing.sm,
    borderRadius: ThemeConfig.borderRadius.medium,
    marginHorizontal: ThemeConfig.spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  quickActionText: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.primary,
    fontWeight: ThemeConfig.fontWeight.medium,
    marginLeft: ThemeConfig.spacing.xs,
  },
  bottomSpacing: {
    height: ThemeConfig.spacing.xxl,
  },
}); 