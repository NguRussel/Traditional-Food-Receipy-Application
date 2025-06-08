import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ListRenderItem,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  RecipeDetail: { recipe: Recipe };
  Categories: { category: string };
};

type Recipe = {
  id: number;
  title: string;
  image: string;
  cookTime: string;
  difficulty: string;
  rating: number;
  category: string;
};

type CategoriesScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Categories'>;
  route: RouteProp<RootStackParamList, 'Categories'>;
};

const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ route, navigation }) => {
  const { category } = route.params || { category: 'All' };

  const recipes: Recipe[] = [
    {
      id: 1,
      title: 'Pancakes',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop',
      cookTime: '15 min',
      difficulty: 'Easy',
      rating: 4.6,
      category: 'Breakfast',
    },
    {
      id: 2,
      title: 'French Toast',
      image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=300&h=200&fit=crop',
      cookTime: '10 min',
      difficulty: 'Easy',
      rating: 4.5,
      category: 'Breakfast',
    },
    {
      id: 3,
      title: 'Avocado Toast',
      image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=300&h=200&fit=crop',
      cookTime: '5 min',
      difficulty: 'Easy',
      rating: 4.4,
      category: 'Breakfast',
    },
  ];

  const renderRecipeItem: ListRenderItem<Recipe> = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <View style={styles.recipeDetails}>
          <Text style={styles.detailText}>{item.cookTime}</Text>
          <Text style={styles.detailText}>•</Text>
          <Text style={styles.detailText}>{item.difficulty}</Text>
          <Text style={styles.detailText}>•</Text>
          <Text style={styles.detailText}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{category} Recipes</Text>
        <Text style={styles.headerSubtitle}>
          {recipes.length} recipes found
        </Text>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecipeItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.recipesList}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A9C2DBFF',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  recipesList: {
    paddingHorizontal: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 4,
  },
});

export default CategoriesScreen; 