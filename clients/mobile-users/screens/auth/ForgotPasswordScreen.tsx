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

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Missing Email',
        text2: 'Please enter your email address',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: error.message,
        });
      } else {
        setEmailSent(true);
        Toast.show({
          type: 'success',
          text1: 'Email Sent!',
          text2: 'Check your email for password reset instructions',
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
            <Text style={styles.headerTitle}>Reset Password</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="lock-closed-outline" size={60} color={Colors.light.primary} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              {emailSent
                ? 'We\'ve sent password reset instructions to your email address.'
                : 'Don\'t worry! Enter your email address and we\'ll send you instructions to reset your password.'}
            </Text>
          </View>

          {!emailSent ? (
            <>
              {/* Email Input */}
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
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
              </View>

              {/* Reset Button */}
              <TouchableOpacity
                style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={styles.resetButtonText}>
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successContainer}>
              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.backToLoginButtonText}>Back to Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => setEmailSent(false)}
              >
                <Text style={styles.resendButtonText}>Didn't receive email? Try again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Back to Sign In */}
          {!emailSent && (
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
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
  iconContainer: {
    alignItems: 'center',
    marginVertical: ThemeConfig.spacing.xxl,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.xxl,
  },
  title: {
    fontSize: ThemeConfig.fontSize.xxxl,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.md,
  },
  subtitle: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: ThemeConfig.spacing.md,
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
  resetButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.large,
    marginBottom: ThemeConfig.spacing.xl,
    ...ThemeConfig.shadows.medium,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
  },
  backToLoginButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: ThemeConfig.spacing.md,
    paddingHorizontal: ThemeConfig.spacing.xl,
    borderRadius: ThemeConfig.borderRadius.large,
    marginBottom: ThemeConfig.spacing.lg,
    ...ThemeConfig.shadows.medium,
  },
  backToLoginButtonText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
  },
  resendButton: {
    paddingVertical: ThemeConfig.spacing.sm,
  },
  resendButtonText: {
    color: Colors.light.primary,
    fontSize: ThemeConfig.fontSize.sm,
    fontWeight: ThemeConfig.fontWeight.medium,
    textDecorationLine: 'underline',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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