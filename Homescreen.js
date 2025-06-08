import React, { useState, useEffect } from 'react';
import {
View,
Text,
ScrollView,
TouchableOpacity,
Image,
TextInput,
FlatList,
StyleSheet,
RefreshControl,
Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
widthPercentageToDP as wp,
heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock data for recipes
const mockFeaturedRecipes = [
{
    id: 1,
    title: 'Creamy Pasta Carbonara',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
    cookTime: '25 min',
    difficulty: 'Medium',
    rating: 4.8,
    chef: 'Marco Romano',
},
{
    id: 2,
    title: 'Grilled Salmon with Herbs',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    cookTime: '20 min',
    difficulty: 'Easy',
    rating: 4.9,
    chef: 'Chef Sarah',
},
{
    id: 3,
    title: 'Classic Beef Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    cookTime: '15 min',
    difficulty: 'Easy',
    rating: 4.7,
    chef: 'John Grill',
},
];

const mockTrendingRecipes = [
{
    id: 4,
    title: 'Avocado Toast Supreme',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
    cookTime: '10 min',
    difficulty: 'Easy',
    rating: 4.6,
    trending: true,
},
{
    id: 5,
    title: 'Spicy Thai Curry',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
    cookTime: '35 min',
    difficulty: 'Hard',
    rating: 4.8,
    trending: true,
},
{
    id: 6,
    title: 'Fresh Caesar Salad',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    cookTime: '15 min',
    difficulty: 'Easy',
    rating: 4.5,
    trending: true,
},
];

const mockRecommendations = [
{
    id: 7,
    title: 'Chocolate Lava Cake',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    cookTime: '30 min',
    difficulty: 'Medium',
    rating: 4.9,
    category: 'Dessert',
},
{
    id: 8,
    title: 'Mediterranean Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    cookTime: '20 min',
    difficulty: 'Easy',
    rating: 4.7,
    category: 'Healthy',
},
];

const categories = [
{ id: 1, name: 'Breakfast', icon: '🥞', color: '#FFE5CC' },
{ id: 2, name: 'Lunch', icon: '🥗', color: '#E5F5E5' },
{ id: 3, name: 'Dinner', icon: '🍖', color: '#FFE5E5' },
{ id: 4, name: 'Dessert', icon: '🍰', color: '#F0E5FF' },
{ id: 5, name: 'Snacks', icon: '🥨', color: '#A99E8CFF' },
];

export default function HomeScreen({ navigation }) {
const [searchText, setSearchText] = useState('');
const [refreshing, setRefreshing] = useState(false);
const [featuredRecipes, setFeaturedRecipes] = useState(mockFeaturedRecipes);
const [trendingRecipes, setTrendingRecipes] = useState(mockTrendingRecipes);
const [recommendations, setRecommendations] = useState(mockRecommendations);

  // Simulate loading data
useEffect(() => {
    loadData();
}, []);

const loadData = async () => {
    // Simulate API call
    setTimeout(() => {
    setFeaturedRecipes(mockFeaturedRecipes);
    setTrendingRecipes(mockTrendingRecipes);
    setRecommendations(mockRecommendations);
    }, 1000);
};

const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
};

const handleSearch = () => {
    if (searchText.trim()) {
      // Navigate to SearchScreen with query
    navigation?.navigate('SearchScreen', { query: searchText });
    }
};

const handleRecipePress = (recipe) => {
    // Navigate to recipe details
    navigation?.navigate('RecipeDetail', { recipe });
};

const handleCategoryPress = (category) => {
    // Navigate to category recipes
    navigation?.navigate('RecipeListScreen', { category: category.name });
};

const handleSeeAll = (section) => {
    navigation?.navigate('RecipeListScreen', { section });
};

const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity
    style={styles.featuredCard}
    onPress={() => handleRecipePress(item)}
    activeOpacity={0.9}
    >
    <Image source={{ uri: item.image }} style={styles.featuredImage} />
    <View style={styles.featuredOverlay}>
        <View style={styles.ratingBadge}>
        <Ionicons name="star" size={12} color="#FFD700" />
        <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle}>{item.title}</Text>
        <Text style={styles.featuredChef}>by {item.chef}</Text>
        <View style={styles.featuredInfo}>
            <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={14} color="white" />
            <Text style={styles.infoText}>{item.cookTime}</Text>
            </View>
            <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
        </View>
        </View>
    </View>
    </TouchableOpacity>
);

const renderTrendingItem = ({ item }) => (
    <TouchableOpacity
    style={styles.trendingCard}
    onPress={() => handleRecipePress(item)}
    activeOpacity={0.8}
    >
    <Image source={{ uri: item.image }} style={styles.trendingImage} />
    <View style={styles.trendingBadge}>
        <Ionicons name="trending-up" size={12} color="#FF6B6B" />
    </View>
    <View style={styles.trendingContent}>
        <Text style={styles.trendingTitle}>{item.title}</Text>
        <View style={styles.trendingInfo}>
        <Text style={styles.trendingTime}>{item.cookTime}</Text>
        <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.trendingRating}>{item.rating}</Text>
        </View>
        </View>
    </View>
    </TouchableOpacity>
);

const renderRecommendationItem = ({ item }) => (
    <TouchableOpacity
    style={styles.recommendationCard}
    onPress={() => handleRecipePress(item)}
    activeOpacity={0.8}
    >
    <Image source={{ uri: item.image }} style={styles.recommendationImage} />
    <View style={styles.recommendationContent}>
        <Text style={styles.recommendationTitle}>{item.title}</Text>
        <Text style={styles.recommendationCategory}>{item.category}</Text>
        <View style={styles.recommendationInfo}>
        <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={12} color="#666" />
            <Text style={styles.recommendationTime}>{item.cookTime}</Text>
        </View>
        <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.recommendationRating}>{item.rating}</Text>
        </View>
        </View>
    </View>
    </TouchableOpacity>
);

const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
    style={[styles.categoryCard, { backgroundColor: item.color }]}
    onPress={() => handleCategoryPress(item)}
    activeOpacity={0.8}
    >
    <Text style={styles.categoryIcon}>{item.icon}</Text>
    <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
);

return (
    <ScrollView
    style={styles.container}
    showsVerticalScrollIndicator={false}
    refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }
    >
    <StatusBar style="dark" />
    
      {/* Header */}
    <View style={styles.header}>
        <View style={styles.headerTop}>
        <View>
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.username}>What would you like to cook?</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={32} color="#333" />
        </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" />
        <TextInput
            style={styles.searchInput}
            placeholder="Search recipes, ingredients..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
        />
        <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => navigation?.navigate('FiltersScreen')}
        >
            <Ionicons name="options-outline" size={20} color="#333" />
        </TouchableOpacity>
        </View>
    </View>

      {/* Categories */}
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
        />
    </View>

      {/* Featured Recipes */}
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Recipes</Text>
        <TouchableOpacity onPress={() => handleSeeAll('featured')}>
            <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
        </View>
        <FlatList
        data={featuredRecipes}
        renderItem={renderFeaturedItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        />
    </View>

      {/* Trending Now */}
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
        <View style={styles.trendingHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <Ionicons name="flame" size={20} color="#F9C585FF" />
        </View>
        <TouchableOpacity onPress={() => handleSeeAll('trending')}>
            <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
        </View>
        <FlatList
        data={trendingRecipes}
        renderItem={renderTrendingItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        />
    </View>

      {/* Recommendations */}
    <View style={[styles.section, styles.lastSection]}>
        <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        <TouchableOpacity onPress={() => handleSeeAll('recommendations')}>
            <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
        </View>
        {recommendations.map((item) => (
        <View key={item.id} style={{ marginBottom: 16 }}>
            {renderRecommendationItem({ item })}
        </View>
        ))}
    </View>
    </ScrollView>
);
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#BDD7EFFF',
},
header: {
    backgroundColor: 'white',
    paddingTop: hp(6),
    paddingHorizontal: wp(5),
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
},
headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
},
greeting: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: '#333',
},
username: {
    fontSize: hp(1.8),
    color: '#666',
    marginTop: 4,
},
profileButton: {
    padding: 4,
},
searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F3AAFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
},
searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: hp(2),
    color: '#333',
},
filterButton: {
    padding: 4,
},
section: {
    marginTop: 24,
    paddingHorizontal: wp(5),
},
lastSection: {
    paddingBottom: 32,
},
sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
},
sectionTitle: {
    fontSize: hp(2.4),
    fontWeight: 'bold',
    color: '#333',
},
trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
},
seeAllText: {
    fontSize: hp(1.8),
    color: '#FF6B6B',
    fontWeight: '600',
},
categoriesList: {
    paddingRight: wp(5),
},
categoryCard: {
    width: wp(20),
    height: wp(20),
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
},
categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
},
categoryName: {
    fontSize: hp(1.4),
    fontWeight: '600',
    color: '#333',
},
horizontalList: {
    paddingRight: wp(5),
},
featuredCard: {
    width: wp(70),
    height: hp(25),
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
},
featuredImage: {
    width: '100%',
    height: '100%',
},
featuredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    justifyContent: 'space-between',
},
ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
},
ratingText: {
    marginLeft: 4,
    fontSize: hp(1.4),
    fontWeight: '600',
    color: '#333',
},
featuredContent: {
    flex: 1,
    justifyContent: 'flex-end',
},
featuredTitle: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
},
featuredChef: {
    fontSize: hp(1.6),
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
},
featuredInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
},
infoText: {
    marginLeft: 4,
    fontSize: hp(1.4),
    color: 'white',
},
difficultyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
},
difficultyText: {
    fontSize: hp(1.3),
    color: 'white',
    fontWeight: '600',
},
trendingCard: {
    width: wp(40),
    backgroundColor: 'white',
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
},
trendingImage: {
    width: '100%',
    height: hp(12),
},
trendingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
},
trendingContent: {
    padding: 12,
},
trendingTitle: {
    fontSize: hp(1.8),
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
},
trendingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
trendingTime: {
    fontSize: hp(1.4),
    color: '#666',
},
ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
},
trendingRating: {
    marginLeft: 4,
    fontSize: hp(1.4),
    fontWeight: '600',
    color: '#333',
},
recommendationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
},
recommendationImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: 12,
},
recommendationContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
},
recommendationTitle: {
    fontSize: hp(2),
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
},
recommendationCategory: {
    fontSize: hp(1.6),
    color: '#D8FF6BFF',
    fontWeight: '500',
    marginBottom: 8,
},
recommendationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
recommendationTime: {
    marginLeft: 4,
    fontSize: hp(1.4),
    color: '#666',
},
recommendationRating: {
    marginLeft: 4,
    fontSize: hp(1.4),
    fontWeight: '600',
    color: '#333',
},
});