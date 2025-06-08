import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ThemeConfig } from '../../constants/Colors';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const { width } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  backgroundColor: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Discover Authentic',
    subtitle: 'Cameroonian Cuisine',
    description: 'Explore traditional recipes from all 10 regions of Cameroon, from Ndolé to Achu, passed down through generations.',
    backgroundColor: '#FF6B35',
    icon: 'restaurant',
  },
  {
    id: '2',
    title: 'Learn from',
    subtitle: 'Master Chefs',
    description: 'Follow step-by-step video tutorials from verified Cameroonian chefs and home cooks sharing their family secrets.',
    backgroundColor: '#FF8960',
    icon: 'play-circle',
  },
  {
    id: '3',
    title: 'Connect with',
    subtitle: 'Your Heritage',
    description: 'Preserve and share your cultural identity through food. Cook traditional meals and create lasting memories.',
    backgroundColor: '#FFA680',
    icon: 'heart',
  },
];

type OnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      navigation.navigate('Welcome');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Welcome');
  };

  const renderOnboardingItem = ({ item }: { item: OnboardingItem }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={item.backgroundColor} />
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name={item.icon} size={120} color="white" />
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {onboardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.3)',
              width: index === currentIndex ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        {renderPagination()}
        
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons 
              name={currentIndex === onboardingData.length - 1 ? 'checkmark' : 'arrow-forward'} 
              size={20} 
              color="white" 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingTop: ThemeConfig.spacing.md,
    zIndex: 1,
  },
  skipButton: {
    paddingVertical: ThemeConfig.spacing.sm,
    paddingHorizontal: ThemeConfig.spacing.md,
  },
  skipText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.xl,
  },
  imagePlaceholder: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contentContainer: {
    paddingHorizontal: ThemeConfig.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: ThemeConfig.fontSize.xxxl,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: ThemeConfig.spacing.xs,
  },
  subtitle: {
    fontSize: ThemeConfig.fontSize.xxxl,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: ThemeConfig.spacing.lg,
  },
  description: {
    fontSize: ThemeConfig.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: ThemeConfig.spacing.md,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: ThemeConfig.spacing.xl,
    paddingBottom: ThemeConfig.spacing.xl,
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.xl,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    width: '100%',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.large,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButtonText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    marginRight: ThemeConfig.spacing.sm,
  },
}); 