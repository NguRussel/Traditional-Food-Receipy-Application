import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ThemeConfig } from '../../constants/Colors';
import Toast from 'react-native-toast-message';

interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  chefName: string;
  cookingTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
}

interface Chef {
  id: string;
  name: string;
  avatar: string;
  specialization: string;
  recipesCount: number;
  isVerified: boolean;
  region: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  recipeCount: number;
  coverImage: string;
  isPrivate: boolean;
  createdAt: Date;
}

const mockFavoriteRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Traditional Ndolé',
    description: 'Authentic Cameroonian national dish with bitter leaves',
    image: 'https://via.placeholder.com/150x150/FF6B35/FFFFFF?text=Ndolé',
    chefName: 'Mama Ngozi',
    cookingTime: 90,
    difficulty: 'Medium',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Achu Soup',
    description: 'Yellow soup from Northwest Cameroon',
    image: 'https://via.placeholder.com/150x150/FFD700/000000?text=Achu',
    chefName: 'Chef Boniface',
    cookingTime: 60,
    difficulty: 'Medium',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Poulet DG',
    description: 'Chicken with plantains and vegetables',
    image: 'https://via.placeholder.com/150x150/228B22/FFFFFF?text=Poulet',
    chefName: 'Chef Marie',
    cookingTime: 45,
    difficulty: 'Easy',
    rating: 4.7,
  },
];

const mockFollowedChefs: Chef[] = [
  {
    id: '1',
    name: 'Mama Ngozi',
    avatar: 'https://via.placeholder.com/60x60/FF6B35/FFFFFF?text=MN',
    specialization: 'Traditional Cuisine',
    recipesCount: 45,
    isVerified: true,
    region: 'Centre',
  },
  {
    id: '2',
    name: 'Chef Boniface',
    avatar: 'https://via.placeholder.com/60x60/0066CC/FFFFFF?text=CB',
    specialization: 'Regional Specialties',
    recipesCount: 32,
    isVerified: true,
    region: 'Northwest',
  },
  {
    id: '3',
    name: 'Chef Marie',
    avatar: 'https://via.placeholder.com/60x60/800080/FFFFFF?text=CM',
    specialization: 'Modern Fusion',
    recipesCount: 28,
    isVerified: false,
    region: 'Littoral',
  },
];

const mockCollections: Collection[] = [
  {
    id: '1',
    name: 'Sunday Specials',
    description: 'Recipes for special family gatherings',
    recipeCount: 12,
    coverImage: 'https://via.placeholder.com/100x100/FF6B35/FFFFFF?text=SS',
    isPrivate: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    id: '2',
    name: 'Quick Weekday Meals',
    description: 'Fast and easy Cameroonian dishes',
    recipeCount: 8,
    coverImage: 'https://via.placeholder.com/100x100/228B22/FFFFFF?text=QW',
    isPrivate: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
  },
  {
    id: '3',
    name: 'Festive Recipes',
    description: 'Traditional holiday and celebration dishes',
    recipeCount: 15,
    coverImage: 'https://via.placeholder.com/100x100/FFD700/000000?text=FR',
    isPrivate: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  },
];

type TabType = 'recipes' | 'chefs' | 'collections';

export default function FavoritesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('recipes');
  const [favoriteRecipes, setFavoriteRecipes] = useState(mockFavoriteRecipes);
  const [followedChefs, setFollowedChefs] = useState(mockFollowedChefs);
  const [collections, setCollections] = useState(mockCollections);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isPrivateCollection, setIsPrivateCollection] = useState(false);

  const removeFromFavorites = (recipeId: string) => {
    Alert.alert(
      'Remove from Favorites',
      'Are you sure you want to remove this recipe from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFavoriteRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
            Toast.show({
              type: 'success',
              text1: 'Recipe removed from favorites',
            });
          },
        },
      ]
    );
  };

  const unfollowChef = (chefId: string) => {
    Alert.alert(
      'Unfollow Chef',
      'Are you sure you want to unfollow this chef?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: () => {
            setFollowedChefs(prev => prev.filter(chef => chef.id !== chefId));
            Toast.show({
              type: 'success',
              text1: 'Chef unfollowed successfully',
            });
          },
        },
      ]
    );
  };

  const createCollection = () => {
    if (!newCollectionName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Collection name is required',
      });
      return;
    }

    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName.trim(),
      description: newCollectionDescription.trim(),
      recipeCount: 0,
      coverImage: 'https://via.placeholder.com/100x100/FF6B35/FFFFFF?text=NC',
      isPrivate: isPrivateCollection,
      createdAt: new Date(),
    };

    setCollections(prev => [newCollection, ...prev]);
    setShowCreateCollection(false);
    setNewCollectionName('');
    setNewCollectionDescription('');
    setIsPrivateCollection(false);

    Toast.show({
      type: 'success',
      text1: 'Collection created successfully',
    });
  };

  const deleteCollection = (collectionId: string) => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCollections(prev => prev.filter(collection => collection.id !== collectionId));
            Toast.show({
              type: 'success',
              text1: 'Collection deleted successfully',
            });
          },
        },
      ]
    );
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.recipeCard} activeOpacity={0.8}>
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => removeFromFavorites(item.id)}
      >
        <Ionicons name="heart" size={20} color={Colors.light.error} />
      </TouchableOpacity>
      
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.recipeMetadata}>
          <View style={styles.metadataItem}>
            <Ionicons name="person-outline" size={12} color={Colors.light.textSecondary} />
            <Text style={styles.metadataText}>{item.chefName}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="time-outline" size={12} color={Colors.light.textSecondary} />
            <Text style={styles.metadataText}>{item.cookingTime}m</Text>
          </View>
        </View>
        
        <View style={styles.recipeFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={Colors.light.warning} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <View style={[styles.difficultyBadge, styles[`difficulty${item.difficulty}`]]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderChefCard = ({ item }: { item: Chef }) => (
    <TouchableOpacity style={styles.chefCard} activeOpacity={0.8}>
      <Image source={{ uri: item.avatar }} style={styles.chefAvatar} />
      
      <View style={styles.chefInfo}>
        <View style={styles.chefNameRow}>
          <Text style={styles.chefName}>{item.name}</Text>
          {item.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color={Colors.light.info} />
          )}
        </View>
        
        <Text style={styles.chefSpecialization}>{item.specialization}</Text>
        <Text style={styles.chefRegion}>{item.region} Region</Text>
        
        <View style={styles.chefStats}>
          <Text style={styles.chefStatsText}>{item.recipesCount} recipes</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.unfollowButton}
        onPress={() => unfollowChef(item.id)}
      >
        <Text style={styles.unfollowButtonText}>Following</Text>
        <Ionicons name="checkmark" size={16} color={Colors.light.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCollectionCard = ({ item }: { item: Collection }) => (
    <TouchableOpacity style={styles.collectionCard} activeOpacity={0.8}>
      <Image source={{ uri: item.coverImage }} style={styles.collectionImage} />
      
      <View style={styles.collectionInfo}>
        <View style={styles.collectionHeader}>
          <View style={styles.collectionTitleRow}>
            <Text style={styles.collectionName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isPrivate && (
              <Ionicons name="lock-closed" size={14} color={Colors.light.textSecondary} />
            )}
          </View>
          
          <TouchableOpacity
            style={styles.deleteCollectionButton}
            onPress={() => deleteCollection(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.light.error} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.collectionDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.collectionFooter}>
          <Text style={styles.collectionCount}>
            {item.recipeCount} {item.recipeCount === 1 ? 'recipe' : 'recipes'}
          </Text>
          <Text style={styles.collectionDate}>
            Created {item.createdAt.toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = (type: TabType) => {
    const emptyStates = {
      recipes: {
        icon: 'heart-outline',
        title: 'No Favorite Recipes',
        description: 'Start exploring and save recipes you love!',
      },
      chefs: {
        icon: 'people-outline',
        title: 'No Followed Chefs',
        description: 'Follow chefs to see their latest recipes and updates.',
      },
      collections: {
        icon: 'folder-outline',
        title: 'No Collections',
        description: 'Create collections to organize your favorite recipes.',
      },
    };

    const state = emptyStates[type];

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name={state.icon as keyof typeof Ionicons.glyphMap} size={80} color={Colors.light.textMuted} />
        <Text style={styles.emptyTitle}>{state.title}</Text>
        <Text style={styles.emptyDescription}>{state.description}</Text>
        
        {type === 'collections' && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateCollection(true)}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.createButtonText}>Create Collection</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const getTabData = () => {
    switch (activeTab) {
      case 'recipes':
        return favoriteRecipes;
      case 'chefs':
        return followedChefs;
      case 'collections':
        return collections;
      default:
        return [];
    }
  };

  const renderTabContent = () => {
    const data = getTabData();
    
    if (data.length === 0) {
      return renderEmptyState(activeTab);
    }

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={
          activeTab === 'recipes' ? renderRecipeCard :
          activeTab === 'chefs' ? renderChefCard :
          renderCollectionCard
        }
        numColumns={activeTab === 'recipes' ? 2 : 1}
        columnWrapperStyle={activeTab === 'recipes' ? styles.recipeRow : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        
        {activeTab === 'collections' && collections.length > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateCollection(true)}
          >
            <Ionicons name="add" size={24} color={Colors.light.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}
          onPress={() => setActiveTab('recipes')}
        >
          <Ionicons
            name={activeTab === 'recipes' ? 'restaurant' : 'restaurant-outline'}
            size={20}
            color={activeTab === 'recipes' ? 'white' : Colors.light.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>
            Recipes ({favoriteRecipes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'chefs' && styles.activeTab]}
          onPress={() => setActiveTab('chefs')}
        >
          <Ionicons
            name={activeTab === 'chefs' ? 'people' : 'people-outline'}
            size={20}
            color={activeTab === 'chefs' ? 'white' : Colors.light.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'chefs' && styles.activeTabText]}>
            Chefs ({followedChefs.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'collections' && styles.activeTab]}
          onPress={() => setActiveTab('collections')}
        >
          <Ionicons
            name={activeTab === 'collections' ? 'folder' : 'folder-outline'}
            size={20}
            color={activeTab === 'collections' ? 'white' : Colors.light.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'collections' && styles.activeTabText]}>
            Collections ({collections.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderTabContent()}

      {/* Create Collection Modal */}
      <Modal
        visible={showCreateCollection}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateCollection(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Collection</Text>
            <TouchableOpacity onPress={createCollection}>
              <Text style={styles.modalCreateText}>Create</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Collection Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter collection name"
                placeholderTextColor={Colors.light.textMuted}
                value={newCollectionName}
                onChangeText={setNewCollectionName}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your collection"
                placeholderTextColor={Colors.light.textMuted}
                value={newCollectionDescription}
                onChangeText={setNewCollectionDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Private Collection</Text>
                <Text style={styles.switchDescription}>
                  Only you can see private collections
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.switch, isPrivateCollection && styles.switchActive]}
                onPress={() => setIsPrivateCollection(!isPrivateCollection)}
              >
                <View style={[styles.switchThumb, isPrivateCollection && styles.switchThumbActive]} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
  addButton: {
    padding: ThemeConfig.spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    backgroundColor: Colors.light.card,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ThemeConfig.spacing.sm,
    paddingHorizontal: ThemeConfig.spacing.sm,
    borderRadius: ThemeConfig.borderRadius.medium,
    marginHorizontal: ThemeConfig.spacing.xs,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: ThemeConfig.fontSize.sm,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: Colors.light.textSecondary,
    marginLeft: ThemeConfig.spacing.xs,
  },
  activeTabText: {
    color: 'white',
  },
  listContent: {
    padding: ThemeConfig.spacing.lg,
  },
  recipeRow: {
    justifyContent: 'space-between',
  },
  recipeCard: {
    backgroundColor: Colors.light.card,
    borderRadius: ThemeConfig.borderRadius.medium,
    marginBottom: ThemeConfig.spacing.md,
    width: '48%',
    ...ThemeConfig.shadows.small,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: ThemeConfig.borderRadius.medium,
    borderTopRightRadius: ThemeConfig.borderRadius.medium,
  },
  favoriteButton: {
    position: 'absolute',
    top: ThemeConfig.spacing.sm,
    right: ThemeConfig.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: ThemeConfig.spacing.xs,
  },
  recipeInfo: {
    padding: ThemeConfig.spacing.md,
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
    marginBottom: ThemeConfig.spacing.sm,
    lineHeight: 16,
  },
  recipeMetadata: {
    marginBottom: ThemeConfig.spacing.sm,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metadataText: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  recipeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: ThemeConfig.fontSize.sm,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: Colors.light.textPrimary,
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: ThemeConfig.spacing.sm,
    paddingVertical: 2,
    borderRadius: ThemeConfig.borderRadius.small,
  },
  difficultyEasy: {
    backgroundColor: Colors.light.success,
  },
  difficultyMedium: {
    backgroundColor: Colors.light.warning,
  },
  difficultyHard: {
    backgroundColor: Colors.light.error,
  },
  difficultyText: {
    fontSize: ThemeConfig.fontSize.xs,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: 'white',
  },
  chefCard: {
    backgroundColor: Colors.light.card,
    borderRadius: ThemeConfig.borderRadius.medium,
    padding: ThemeConfig.spacing.md,
    marginBottom: ThemeConfig.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...ThemeConfig.shadows.small,
  },
  chefAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: ThemeConfig.spacing.md,
  },
  chefInfo: {
    flex: 1,
  },
  chefNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.xs,
  },
  chefName: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginRight: ThemeConfig.spacing.xs,
  },
  chefSpecialization: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  chefRegion: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: ThemeConfig.spacing.xs,
  },
  chefStats: {
    marginTop: ThemeConfig.spacing.xs,
  },
  chefStatsText: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.primary,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  unfollowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.sm,
    borderRadius: ThemeConfig.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  unfollowButtonText: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: ThemeConfig.fontWeight.medium,
    marginRight: ThemeConfig.spacing.xs,
  },
  collectionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: ThemeConfig.borderRadius.medium,
    padding: ThemeConfig.spacing.md,
    marginBottom: ThemeConfig.spacing.md,
    flexDirection: 'row',
    ...ThemeConfig.shadows.small,
  },
  collectionImage: {
    width: 80,
    height: 80,
    borderRadius: ThemeConfig.borderRadius.medium,
    marginRight: ThemeConfig.spacing.md,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ThemeConfig.spacing.xs,
  },
  collectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  collectionName: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginRight: ThemeConfig.spacing.xs,
    flex: 1,
  },
  deleteCollectionButton: {
    padding: ThemeConfig.spacing.xs,
  },
  collectionDescription: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: ThemeConfig.spacing.sm,
    lineHeight: 16,
  },
  collectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collectionCount: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  collectionDate: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.xl,
  },
  emptyTitle: {
    fontSize: ThemeConfig.fontSize.xl,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginTop: ThemeConfig.spacing.lg,
    marginBottom: ThemeConfig.spacing.sm,
  },
  emptyDescription: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: ThemeConfig.spacing.xl,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.large,
  },
  createButtonText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.semibold,
    marginLeft: ThemeConfig.spacing.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalCancelText: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textSecondary,
  },
  modalTitle: {
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
  },
  modalCreateText: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.primary,
    fontWeight: ThemeConfig.fontWeight.semibold,
  },
  modalContent: {
    flex: 1,
    padding: ThemeConfig.spacing.lg,
  },
  inputGroup: {
    marginBottom: ThemeConfig.spacing.lg,
  },
  inputLabel: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: ThemeConfig.borderRadius.medium,
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.md,
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textPrimary,
    backgroundColor: Colors.light.card,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: Colors.light.primary,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
}); 