import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ThemeConfig } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const recentSearches = ['Ndolé', 'Achu soup', 'Poulet DG', 'Fufu'];

const popularIngredients = [
  'Palm oil', 'Plantain', 'Cassava', 'Fish', 'Beef', 'Spinach', 'Peanuts', 'Pepper'
];

const regions = [
  { name: 'Centre', color: Colors.light.regional.centre },
  { name: 'Littoral', color: Colors.light.regional.littoral },
  { name: 'West', color: Colors.light.regional.west },
  { name: 'North', color: Colors.light.regional.north },
  { name: 'South', color: Colors.light.regional.south },
];

const quickFilters = [
  { id: 'easy', label: 'Easy', icon: 'checkmark-circle-outline' },
  { id: 'quick', label: 'Quick (< 30min)', icon: 'time-outline' },
  { id: 'vegetarian', label: 'Vegetarian', icon: 'leaf-outline' },
  { id: 'traditional', label: 'Traditional', icon: 'library-outline' },
];

const searchResults = [
  {
    id: '1',
    name: 'Ndolé with Fish',
    description: 'Traditional stew with groundnuts and bitter leaves',
    rating: 4.8,
    time: 45,
    difficulty: 'Medium',
    region: 'Centre',
  },
  {
    id: '2',
    name: 'Achu Soup',
    description: 'Yellow soup from Northwest region',
    rating: 4.6,
    time: 60,
    difficulty: 'Hard',
    region: 'Northwest',
  },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowResults(query.length > 0);
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const renderSearchResult = ({ item }: { item: typeof searchResults[0] }) => (
    <TouchableOpacity style={styles.resultCard}>
      <View style={styles.resultImagePlaceholder}>
        <Ionicons name="restaurant" size={32} color={Colors.light.textMuted} />
      </View>
      
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.resultMetadata}>
          <View style={styles.metadataItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.metadataText}>{item.rating}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="time-outline" size={14} color={Colors.light.textSecondary} />
            <Text style={styles.metadataText}>{item.time} min</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="location-outline" size={14} color={Colors.light.textSecondary} />
            <Text style={styles.metadataText}>{item.region}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.bookmarkButton}>
        <Ionicons name="bookmark-outline" size={20} color={Colors.light.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes, ingredients..."
            placeholderTextColor={Colors.light.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {!showResults ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <View style={styles.chipContainer}>
                  {recentSearches.map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.recentSearchChip}
                      onPress={() => handleSearch(search)}
                    >
                      <Ionicons name="time-outline" size={14} color={Colors.light.textSecondary} />
                      <Text style={styles.chipText}>{search}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Popular Ingredients */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Ingredients</Text>
              <View style={styles.chipContainer}>
                {popularIngredients.map((ingredient, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.ingredientChip}
                    onPress={() => handleSearch(ingredient)}
                  >
                    <Text style={styles.chipText}>{ingredient}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Browse by Region */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse by Region</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.regionContainer}>
                  {regions.map((region, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.regionCard, { backgroundColor: region.color }]}
                    >
                      <Ionicons name="location" size={24} color="white" />
                      <Text style={styles.regionText}>{region.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Quick Filters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Filters</Text>
              <View style={styles.chipContainer}>
                {quickFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterChip,
                      activeFilters.includes(filter.id) && styles.activeFilterChip
                    ]}
                    onPress={() => toggleFilter(filter.id)}
                  >
                    <Ionicons 
                      name={filter.icon as any} 
                      size={16} 
                      color={activeFilters.includes(filter.id) ? 'white' : Colors.light.textSecondary} 
                    />
                    <Text style={[
                      styles.filterChipText,
                      activeFilters.includes(filter.id) && styles.activeFilterChipText
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Trending Today */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Today</Text>
              <View style={styles.trendingContainer}>
                <TouchableOpacity style={styles.trendingItem}>
                  <Text style={styles.trendingNumber}>1</Text>
                  <Text style={styles.trendingText}>Jollof Rice</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.trendingItem}>
                  <Text style={styles.trendingNumber}>2</Text>
                  <Text style={styles.trendingText}>Beef Stew</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.trendingItem}>
                  <Text style={styles.trendingNumber}>3</Text>
                  <Text style={styles.trendingText}>Fried Plantain</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          /* Search Results */
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>
              {searchResults.length} results for "{searchQuery}"
            </Text>
            
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: ThemeConfig.borderRadius.medium,
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.sm,
    marginRight: ThemeConfig.spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textPrimary,
    marginLeft: ThemeConfig.spacing.sm,
  },
  filterButton: {
    padding: ThemeConfig.spacing.sm,
    backgroundColor: Colors.light.surface,
    borderRadius: ThemeConfig.borderRadius.medium,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: ThemeConfig.spacing.xl,
    paddingHorizontal: ThemeConfig.spacing.lg,
  },
  sectionTitle: {
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ThemeConfig.spacing.sm,
  },
  recentSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.sm,
    borderRadius: ThemeConfig.borderRadius.large,
    marginRight: ThemeConfig.spacing.sm,
    marginBottom: ThemeConfig.spacing.sm,
  },
  ingredientChip: {
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.sm,
    borderRadius: ThemeConfig.borderRadius.large,
    marginRight: ThemeConfig.spacing.sm,
    marginBottom: ThemeConfig.spacing.sm,
  },
  chipText: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textPrimary,
    marginLeft: ThemeConfig.spacing.xs,
  },
  regionContainer: {
    flexDirection: 'row',
    paddingHorizontal: ThemeConfig.spacing.lg,
  },
  regionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 80,
    borderRadius: ThemeConfig.borderRadius.medium,
    marginRight: ThemeConfig.spacing.md,
  },
  regionText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.sm,
    fontWeight: ThemeConfig.fontWeight.medium,
    marginTop: ThemeConfig.spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.sm,
    borderRadius: ThemeConfig.borderRadius.large,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: ThemeConfig.spacing.sm,
    marginBottom: ThemeConfig.spacing.sm,
  },
  activeFilterChip: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textPrimary,
    marginLeft: ThemeConfig.spacing.xs,
  },
  activeFilterChipText: {
    color: 'white',
  },
  trendingContainer: {
    gap: ThemeConfig.spacing.sm,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.medium,
  },
  trendingNumber: {
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: Colors.light.primary,
    marginRight: ThemeConfig.spacing.md,
    width: 20,
  },
  trendingText: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textPrimary,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: ThemeConfig.spacing.lg,
  },
  resultsHeader: {
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: Colors.light.textPrimary,
    marginVertical: ThemeConfig.spacing.md,
  },
  resultsList: {
    paddingBottom: ThemeConfig.spacing.xl,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: ThemeConfig.borderRadius.medium,
    padding: ThemeConfig.spacing.md,
    marginBottom: ThemeConfig.spacing.md,
    ...ThemeConfig.shadows.small,
  },
  resultImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: ThemeConfig.borderRadius.medium,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ThemeConfig.spacing.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.xs,
  },
  resultDescription: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: ThemeConfig.spacing.sm,
    lineHeight: 18,
  },
  resultMetadata: {
    flexDirection: 'row',
    gap: ThemeConfig.spacing.md,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.textSecondary,
    marginLeft: 2,
  },
  bookmarkButton: {
    padding: ThemeConfig.spacing.sm,
  },
}); 