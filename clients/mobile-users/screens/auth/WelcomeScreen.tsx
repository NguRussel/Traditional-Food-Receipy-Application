import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ThemeConfig } from '../../constants/Colors';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const { width } = Dimensions.get('window');

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <LinearGradient
      colors={[Colors.light.primary, Colors.light.accent]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header with App Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="restaurant" size={60} color="white" />
            <Text style={styles.appName}>AFRI-Plates</Text>
            <Text style={styles.tagline}>Taste of Cameroon</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to Your</Text>
            <Text style={styles.welcomeSubtitle}>Recipe Haven</Text>
            <Text style={styles.welcomeDescription}>
              Discover authentic Cameroonian recipes, connect with master chefs, 
              and preserve your culinary heritage.
            </Text>
          </View>

          {/* Feature Highlights */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="globe-outline" size={24} color="white" />
              <Text style={styles.featureText}>10 Regions</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people-outline" size={24} color="white" />
              <Text style={styles.featureText}>Expert Chefs</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="heart-outline" size={24} color="white" />
              <Text style={styles.featureText}>Traditional</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: ThemeConfig.spacing.xl,
  },
  header: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: ThemeConfig.fontSize.xxxl,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: 'white',
    marginTop: ThemeConfig.spacing.md,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: ThemeConfig.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: ThemeConfig.spacing.xs,
    fontStyle: 'italic',
  },
  content: {
    flex: 0.4,
    justifyContent: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.xxl,
  },
  welcomeTitle: {
    fontSize: ThemeConfig.fontSize.xxl,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: 'white',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: ThemeConfig.fontSize.xxl,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: ThemeConfig.spacing.lg,
  },
  welcomeDescription: {
    fontSize: ThemeConfig.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: ThemeConfig.spacing.md,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.sm,
    marginTop: ThemeConfig.spacing.xs,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  footer: {
    flex: 0.3,
    justifyContent: 'flex-end',
    paddingBottom: ThemeConfig.spacing.lg,
  },
  signUpButton: {
    backgroundColor: 'white',
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.large,
    marginBottom: ThemeConfig.spacing.md,
    ...ThemeConfig.shadows.medium,
  },
  signUpButtonText: {
    color: Colors.light.primary,
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: 'transparent',
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.large,
    borderWidth: 2,
    borderColor: 'white',
    marginBottom: ThemeConfig.spacing.lg,
  },
  signInButtonText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    textAlign: 'center',
  },
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: ThemeConfig.fontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    textDecorationLine: 'underline',
    fontWeight: ThemeConfig.fontWeight.medium,
  },
}); 