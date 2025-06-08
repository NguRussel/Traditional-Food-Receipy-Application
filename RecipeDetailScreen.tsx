import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type RecipeDetailProps = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<any, any>;
};

const RecipeDetailScreen: React.FC<RecipeDetailProps> = ({ route }) => {
  const { recipe } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={{ uri: recipe.image }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cook Time</Text>
              <Text style={styles.infoValue}>{recipe.cookTime}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Difficulty</Text>
              <Text style={styles.infoValue}>{recipe.difficulty}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Rating</Text>
              <Text style={styles.infoValue}>⭐ {recipe.rating}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {recipe.description || 'No description available.'}
            </Text>
          </View>

          {recipe.ingredients && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <Text key={index} style={styles.ingredient}>• {ingredient}</Text>
              ))}
            </View>
          )}

          {recipe.instructions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              {recipe.instructions.map((instruction: string, index: number) => (
                <View key={index} style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>{index + 1}</Text>
                  <Text style={styles.instruction}>{instruction}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  ingredient: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  instructionNumber: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#4CAF50',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 25,
    marginRight: 10,
  },
  instruction: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default RecipeDetailScreen; 