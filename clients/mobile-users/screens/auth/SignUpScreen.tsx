import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ThemeConfig } from '../../constants/Colors';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'>;

interface Props {
  navigation: SignUpScreenNavigationProp;
}

export default function SignUpScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'chef'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const { signUp, signInWithGoogle } = useAuth();

  const handleSignUp = async () => {
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in all fields',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match',
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 6 characters',
      });
      return;
    }

    if (!acceptedTerms) {
      Toast.show({
        type: 'error',
        text1: 'Terms Required',
        text2: 'Please accept the terms and conditions',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, {
        full_name: fullName,
        role: role,
      });
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Sign Up Failed',
          text2: error.message,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Account Created!',
          text2: 'Please check your email to verify your account',
        });
        // Navigation will be handled by the AuthContext
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!acceptedTerms) {
      Toast.show({
        type: 'error',
        text1: 'Terms Required',
        text2: 'Please accept the terms and conditions',
      });
      return;
    }

    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Google Sign Up Failed',
          text2: error.message,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Welcome to AFRI-Plates!',
          text2: 'Successfully signed up with Google',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.light.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Welcome Message */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Join AFRI-Plates!</Text>
            <Text style={styles.welcomeSubtitle}>
              Create your account to discover amazing Cameroonian recipes
            </Text>
          </View>

          {/* Google Sign Up Button */}
          <TouchableOpacity
            style={[styles.googleButton, googleLoading && styles.googleButtonDisabled]}
            onPress={handleGoogleSignUp}
            disabled={googleLoading}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text style={styles.googleButtonText}>
              {googleLoading ? 'Signing up with Google...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Role Selection */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'user' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('user')}
              >
                <Ionicons 
                  name="heart-outline" 
                  size={24} 
                  color={role === 'user' ? 'white' : Colors.light.primary} 
                />
                <Text style={[
                  styles.roleButtonText,
                  role === 'user' && styles.roleButtonTextActive,
                ]}>
                  Food Lover
                </Text>
                <Text style={[
                  styles.roleButtonSubtext,
                  role === 'user' && styles.roleButtonSubtextActive,
                ]}>
                  Discover & enjoy recipes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'chef' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('chef')}
              >
                <Ionicons 
                  name="restaurant-outline" 
                  size={24} 
                  color={role === 'chef' ? 'white' : Colors.light.primary} 
                />
                <Text style={[
                  styles.roleButtonText,
                  role === 'chef' && styles.roleButtonTextActive,
                ]}>
                  Chef
                </Text>
                <Text style={[
                  styles.roleButtonSubtext,
                  role === 'chef' && styles.roleButtonSubtextActive,
                ]}>
                  Share your recipes
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.light.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.light.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Create a password"
                  placeholderTextColor={Colors.light.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={Colors.light.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm your password"
                  placeholderTextColor={Colors.light.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={Colors.light.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            <View style={[
              styles.checkbox,
              acceptedTerms && styles.checkboxActive,
            ]}>
              {acceptedTerms && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: ThemeConfig.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: ThemeConfig.spacing.lg,
  },
  backButton: {
    padding: ThemeConfig.spacing.sm,
  },
  headerTitle: {
    fontSize: ThemeConfig.fontSize.xl,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.xl,
  },
  welcomeTitle: {
    fontSize: ThemeConfig.fontSize.xxxl,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.large,
    marginBottom: ThemeConfig.spacing.lg,
    ...ThemeConfig.shadows.small,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    marginLeft: ThemeConfig.spacing.sm,
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: Colors.light.textPrimary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    marginHorizontal: ThemeConfig.spacing.md,
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  roleContainer: {
    marginBottom: ThemeConfig.spacing.xl,
  },
  roleLabel: {
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.md,
    textAlign: 'center',
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: ThemeConfig.spacing.md,
  },
  roleButton: {
    flex: 1,
    padding: ThemeConfig.spacing.lg,
    borderRadius: ThemeConfig.borderRadius.large,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  roleButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  roleButtonText: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.primary,
    marginTop: ThemeConfig.spacing.xs,
  },
  roleButtonTextActive: {
    color: 'white',
  },
  roleButtonSubtext: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: ThemeConfig.spacing.xs,
    textAlign: 'center',
  },
  roleButtonSubtextActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    marginBottom: ThemeConfig.spacing.lg,
  },
  inputContainer: {
    marginBottom: ThemeConfig.spacing.lg,
  },
  inputLabel: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: ThemeConfig.borderRadius.medium,
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textInput: {
    flex: 1,
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textPrimary,
    marginLeft: ThemeConfig.spacing.sm,
    paddingVertical: ThemeConfig.spacing.sm,
  },
  eyeButton: {
    padding: ThemeConfig.spacing.xs,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: ThemeConfig.spacing.xl,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 4,
    marginRight: ThemeConfig.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  termsText: {
    flex: 1,
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.light.primary,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  signUpButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.large,
    marginBottom: ThemeConfig.spacing.xl,
    ...ThemeConfig.shadows.medium,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    textAlign: 'center',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: ThemeConfig.spacing.xl,
  },
  signInText: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textSecondary,
  },
  signInLink: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.primary,
    fontWeight: ThemeConfig.fontWeight.semibold,
  },
});