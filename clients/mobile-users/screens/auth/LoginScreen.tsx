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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ThemeConfig } from '../../constants/Colors';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter both email and password',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Sign In Failed',
          text2: error.message,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Welcome back!',
          text2: 'Successfully signed in',
        });
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
            <Text style={styles.headerTitle}>Sign In</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Welcome Message */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue exploring amazing Cameroonian recipes
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
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
                  placeholder="Enter your password"
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

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInButton, loading && styles.signInButtonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.signInButtonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
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
    marginBottom: ThemeConfig.spacing.xxl,
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
  formContainer: {
    marginBottom: ThemeConfig.spacing.xl,
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: ThemeConfig.spacing.sm,
  },
  forgotPasswordText: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  signInButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.large,
    marginBottom: ThemeConfig.spacing.xl,
    ...ThemeConfig.shadows.medium,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    textAlign: 'center',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textSecondary,
  },
  signUpLink: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.primary,
    fontWeight: ThemeConfig.fontWeight.semibold,
  },
}); 