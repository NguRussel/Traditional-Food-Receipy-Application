import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ThemeConfig } from '../../constants/Colors';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const { width, height } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  gradientColors: string[];
  icon: keyof typeof Ionicons.glyphMap;
  iconSize: number;
  accent: string;
  features: string[];
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Connect with Your',
    subtitle: 'Heritage',
    description: 'Preserve and share your cultural identity through food. Cook traditional meals and create lasting memories with authentic Cameroonian recipes.',
    gradientColors: ['#FF6B35', '#FF8F65'],
    icon: 'heart-circle',
    iconSize: 120,
    accent: '#FFE5DC',
    features: ['Cultural Recipes', 'Family Traditions'],
  },
  {
    id: '2',
    title: 'Learn from Master',
    subtitle: 'Chefs',
    description: 'Follow step-by-step video tutorials from verified Cameroonian chefs and home cooks sharing their family secrets and traditional techniques.',
    gradientColors: ['#FF8960', '#FFB088'],
    icon: 'play-circle',
    iconSize: 120,
    accent: '#FFE8E0',
    features: ['Video Tutorials', 'Expert Guidance'],
  },
  {
    id: '3',
    title: 'Discover Authentic',
    subtitle: 'Cameroonian Cuisine',
    description: 'Explore traditional recipes from all 10 regions of Cameroon. Learn to cook dishes like Ndolé, Achu, and more, passed down through generations.',
    gradientColors: ['#FFA680', '#FFCDB2'],
    icon: 'restaurant',
    iconSize: 120,
    accent: '#FFF0EB',
    features: ['Regional Dishes', '10 Regions'],
  },
];

type OnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate in the content when component mounts or index changes
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for the icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [currentIndex]);

  const resetAnimations = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    slideAnim.setValue(50);
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      resetAnimations();
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

  const renderOnboardingItem = ({ item, index }: { item: OnboardingItem; index: number }) => (
    <LinearGradient
      colors={item.gradientColors}
      style={styles.slide}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor={item.gradientColors[0]} />
      
      {/* Decorative Elements */}
      <View style={styles.decorativeContainer}>
        <View style={[styles.decorativeCircle, styles.circle1, { backgroundColor: item.accent }]} />
        <View style={[styles.decorativeCircle, styles.circle2, { backgroundColor: item.accent }]} />
        <View style={[styles.decorativeCircle, styles.circle3, { backgroundColor: item.accent }]} />
      </View>

      {/* Main Content */}
      <Animated.View 
        style={[
          styles.imageContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View 
          style={[
            styles.imagePlaceholder, 
            { 
              backgroundColor: item.accent,
              transform: [{ scale: pulseAnim }],
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={item.iconSize} color={item.gradientColors[0]} />
          </View>
          
          {/* Pulse animation rings */}
          <View style={[styles.pulseRing, styles.ring1, { borderColor: item.gradientColors[0] }]} />
          <View style={[styles.pulseRing, styles.ring2, { borderColor: item.gradientColors[0] }]} />
        </Animated.View>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.description}>{item.description}</Text>
        
        {/* Feature indicators */}
        <View style={styles.featureContainer}>
          {item.features.map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {onboardingData.map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            if (index !== currentIndex) {
              resetAnimations();
              setCurrentIndex(index);
              flatListRef.current?.scrollToIndex({ index, animated: true });
            }
          }}
        >
          <Animated.View
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.4)',
                width: index === currentIndex ? 28 : 10,
                height: 10,
              },
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.stepIndicator}>
            {currentIndex + 1} / {onboardingData.length}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Onboarding Content */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          if (index !== currentIndex) {
            resetAnimations();
            setCurrentIndex(index);
          }
        }}
        keyExtractor={(item) => item.id}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {renderPagination()}
        
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1 ? 'Start Cooking' : 'Next'}
            </Text>
            <Ionicons 
              name={currentIndex === onboardingData.length - 1 ? 'restaurant' : 'arrow-forward'} 
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingTop: ThemeConfig.spacing.md,
    zIndex: 1,
  },
  headerLeft: {
    flex: 1,
  },
  stepIndicator: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: ThemeConfig.fontSize.sm,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  skipButton: {
    paddingVertical: ThemeConfig.spacing.sm,
    paddingHorizontal: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  skipText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.semibold,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.08,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 200,
    left: -30,
  },
  circle3: {
    width: 120,
    height: 120,
    top: height * 0.35,
    right: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    position: 'relative',
  },
  iconContainer: {
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 1000,
    opacity: 0.2,
  },
  ring1: {
    width: 320,
    height: 320,
    top: -20,
    left: -20,
  },
  ring2: {
    width: 360,
    height: 360,
    top: -40,
    left: -40,
    opacity: 0.1,
  },
  contentContainer: {
    paddingHorizontal: ThemeConfig.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: ThemeConfig.spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: ThemeConfig.spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: ThemeConfig.fontSize.md,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: ThemeConfig.spacing.sm,
    marginBottom: ThemeConfig.spacing.lg,
  },
  featureContainer: {
    alignItems: 'center',
    gap: ThemeConfig.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ThemeConfig.spacing.sm,
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: ThemeConfig.fontSize.sm,
    fontWeight: ThemeConfig.fontWeight.medium,
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
    gap: ThemeConfig.spacing.sm,
  },
  paginationDot: {
    borderRadius: 5,
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.bold,
    marginRight: ThemeConfig.spacing.sm,
  },
}); 