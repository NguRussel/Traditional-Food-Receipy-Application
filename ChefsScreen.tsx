import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSocialContext } from '../scripts/Social';
import { StarRating } from '../components/StarRating';
import { StackNavigationProp } from '@react-navigation/stack';

type ChefsScreenProps = {
  navigation: StackNavigationProp<any>;
};

export const ChefsScreen: React.FC<ChefsScreenProps> = ({ navigation }) => {
  const { chefs, following, setFollowing } = useSocialContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredChefs = chefs.filter(chef =>
    chef.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFollowing = (chefId: string) => {
    return following.includes(chefId);
  };

  const toggleFollow = (chefId: string) => {
    if (isFollowing(chefId)) {
      setFollowing(following.filter(f => f !== chefId));
    } else {
      setFollowing([...following, chefId]);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderChef = ({ item }) => (
    <View style={styles.chefCard}>
      <View style={styles.chefHeader}>
        <Image 
          source={{ uri: item.avatar }} 
          style={styles.chefAvatar}
          defaultSource={require('../assets/default-avatar.png')}
        />
        <View style={styles.chefInfo}>
          <View style={styles.chefNameRow}>
            <Text style={styles.chefName}>{item.name}</Text>
            {item.verified && <Text style={styles.verifiedBadge}>✓</Text>}
          </View>
          <Text style={styles.chefLocation}>{item.location}</Text>
        </View>
      </View>

      <Text style={styles.chefBio} numberOfLines={2}>{item.bio}</Text>

      <View style={styles.chefStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.followers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.recipesCount}</Text>
          <Text style={styles.statLabel}>Recipes</Text>
        </View>
        <View style={styles.statItem}>
          <StarRating rating={item.rating} size={14} />
          <Text style={styles.statLabel}>{item.rating}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.followButton, isFollowing(item.id) && styles.followingButton]}
        onPress={() => toggleFollow(item.id)}
      >
        <Text style={[styles.followButtonText, isFollowing(item.id) && styles.followingButtonText]}>
          {isFollowing(item.id) ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search chefs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
      </View>

      <FlatList
        data={filteredChefs}
        renderItem={renderChef}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  listContainer: {
    padding: 10,
  },
  chefCard: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chefHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chefAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  chefInfo: {
    flex: 1,
  },
  chefNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chefName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
  },
  verifiedBadge: {
    color: '#4CAF50',
    fontSize: 16,
  },
  chefLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  chefBio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  chefStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  followButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  followButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  followingButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  followingButtonText: {
    color: '#4CAF50',
  },
});

export default ChefsScreen; 