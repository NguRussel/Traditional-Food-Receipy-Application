import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../constants/Colors';

export default function AccountManagementScreen() {
  const { user, signOut, deleteAccount } = useAuth();
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      '🚪 Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: performSignOut,
        },
      ]
    );
  };

  const performSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await signOut();
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Sign Out Failed',
          text2: error.message || 'Please try again',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: '👋 Signed Out',
          text2: 'See you soon!',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This action is permanent and cannot be undone.\n\nYour account and all associated data will be permanently deleted:\n\n• Profile and preferences\n• Saved recipes and favorites\n• Meal plans and collections\n• Reviews and ratings\n• All app data',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => setShowDeleteForm(true),
        },
      ]
    );
  };

  const validateDeleteConfirmation = () => {
    return deleteConfirmation.toLowerCase() === 'delete my account';
  };

  const performDeleteAccount = async () => {
    if (!validateDeleteConfirmation()) {
      Toast.show({
        type: 'error',
        text1: 'Confirmation Required',
        text2: 'Please type "DELETE MY ACCOUNT" exactly as shown',
      });
      return;
    }

    Alert.alert(
      '⚠️ Last Warning',
      'This is your final chance to cancel. Your account will be permanently deleted right now.',
      [
        {
          text: 'Cancel - Keep My Account',
          style: 'cancel',
        },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: executeAccountDeletion,
        },
      ]
    );
  };

  const executeAccountDeletion = async () => {
    try {
      setIsLoading(true);
      
      Toast.show({
        type: 'info',
        text1: '🔄 Processing',
        text2: 'Deleting your account...',
      });

      const { error } = await deleteAccount();

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Deletion Failed',
          text2: error.message || 'Please contact support for assistance',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: '✅ Account Deleted',
          text2: 'Your account has been permanently removed',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unexpected error occurred. Please contact support.',
      });
    } finally {
      setIsLoading(false);
      setDeleteConfirmation('');
      setShowDeleteForm(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
      padding: 20,
    },
    header: {
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 15,
    },
    accountInfo: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userEmail: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    userType: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 18,
      borderRadius: 12,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    signOutButton: {
      backgroundColor: colors.warning + '20',
      borderColor: colors.warning,
    },
    deleteButton: {
      backgroundColor: colors.error + '20',
      borderColor: colors.error,
    },
    buttonIcon: {
      marginRight: 15,
    },
    buttonText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    signOutText: {
      color: colors.warning,
    },
    deleteText: {
      color: colors.error,
    },
    confirmationSection: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      marginTop: 20,
      borderWidth: 2,
      borderColor: colors.error,
    },
    confirmationTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.error,
      marginBottom: 12,
    },
    confirmationInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      marginBottom: 15,
    },
    confirmationHint: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: 15,
    },
    confirmButton: {
      backgroundColor: colors.error,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      opacity: 0.5,
    },
    confirmButtonActive: {
      opacity: 1,
    },
    confirmButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    warningCard: {
      backgroundColor: colors.warning + '20',
      borderColor: colors.warning,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    warningText: {
      color: colors.warning,
      fontSize: 14,
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Account Management</Text>
            <Text style={styles.subtitle}>
              Manage your account settings, logout, or delete your account
            </Text>
          </View>

          {/* Current Account Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Account</Text>
            <View style={styles.accountInfo}>
              <Text style={styles.userEmail}>
                {user?.email || 'No email available'}
              </Text>
              <Text style={styles.userType}>
                User Account • Created {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Actions</Text>
            
            {/* Sign Out Button */}
            <TouchableOpacity
              style={[styles.button, styles.signOutButton]}
              onPress={handleSignOut}
              disabled={isLoading}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color={colors.warning}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, styles.signOutText]}>
                Sign Out
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.warning}
              />
            </TouchableOpacity>

            {/* Warning Card */}
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                ⚠️ Signing out will require you to log back in with your credentials.
              </Text>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.error }]}>
              Danger Zone
            </Text>
            
            {/* Delete Account Button */}
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDeleteAccount}
              disabled={isLoading}
            >
              <Ionicons
                name="trash-outline"
                size={24}
                color={colors.error}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, styles.deleteText]}>
                Delete Account
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.error}
              />
            </TouchableOpacity>

            {/* Delete Confirmation Form */}
            {showDeleteForm && (
              <View style={styles.confirmationSection}>
                <Text style={styles.confirmationTitle}>
                  ⚠️ Confirm Account Deletion
                </Text>
                <Text style={styles.confirmationHint}>
                  Type "DELETE MY ACCOUNT" to confirm permanent deletion:
                </Text>
                <TextInput
                  style={styles.confirmationInput}
                  value={deleteConfirmation}
                  onChangeText={setDeleteConfirmation}
                  placeholder="DELETE MY ACCOUNT"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    validateDeleteConfirmation() && styles.confirmButtonActive,
                  ]}
                  onPress={performDeleteAccount}
                  disabled={!validateDeleteConfirmation() || isLoading}
                >
                  <Text style={styles.confirmButtonText}>
                    {isLoading ? 'Deleting...' : 'DELETE MY ACCOUNT FOREVER'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 