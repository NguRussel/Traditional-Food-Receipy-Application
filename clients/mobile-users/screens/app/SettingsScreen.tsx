import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, ThemeConfig } from '../../constants/Colors';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  type: 'toggle' | 'select' | 'navigation' | 'action';
  icon: keyof typeof Ionicons.glyphMap;
  value?: boolean | string;
  options?: { label: string; value: string }[];
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const { themeMode, isDarkMode, setThemeMode } = useTheme();
  const { user, deleteAccount } = useAuth();
  const colors = getThemeColors(isDarkMode);

  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [recipeReminders, setRecipeReminders] = useState(true);
  const [socialNotifications, setSocialNotifications] = useState(true);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [shareActivity, setShareActivity] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(true);

  // App preferences
  const [autoPlayVideos, setAutoPlayVideos] = useState(false);
  const [offlineDownloads, setOfflineDownloads] = useState(false);
  const [highQualityImages, setHighQualityImages] = useState(true);

  const handleThemeSelection = () => {
    Alert.alert(
      'Choose Theme',
      'Select your preferred theme mode',
      [
        {
          text: 'Light',
          onPress: () => setThemeMode('light'),
        },
        {
          text: 'Dark',
          onPress: () => setThemeMode('dark'),
        },
        {
          text: 'System',
          onPress: () => setThemeMode('system'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleLanguageSelection = () => {
    Alert.alert(
      'Language & Region',
      'Select your preferred language',
      [
        {
          text: 'English',
          onPress: () => Toast.show({
            type: 'success',
            text1: 'Language Changed',
            text2: 'Language set to English',
          }),
        },
        {
          text: 'Français',
          onPress: () => Toast.show({
            type: 'info',
            text1: 'Coming Soon',
            text2: 'French language support will be available soon',
          }),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleDataManagement = () => {
    Alert.alert(
      'Data Management',
      'Choose an option to manage your data',
      [
        {
          text: 'Clear Cache',
          onPress: () => Toast.show({
            type: 'success',
            text1: 'Cache Cleared',
            text2: 'App cache has been cleared successfully',
          }),
        },
        {
          text: 'Export Data',
          onPress: () => Toast.show({
            type: 'info',
            text1: 'Coming Soon',
            text2: 'Data export feature will be available soon',
          }),
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => handleDeleteAccount(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.\n\nThis will delete:\n• Your profile and preferences\n• All saved recipes and favorites\n• Meal plans and collections\n• All app data',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Show final confirmation
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'I understand, delete my account',
                  style: 'destructive',
                  onPress: performAccountDeletion,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const performAccountDeletion = async () => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Deleting Account',
        text2: 'Please wait while we delete your account...',
      });

      const { error } = await deleteAccount();

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Deletion Failed',
          text2: error.message || 'Failed to delete account. Please contact support.',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Account Deleted',
          text2: 'Your account has been permanently deleted.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  const openPrivacyPolicy = () => {
    Toast.show({
      type: 'info',
      text1: 'Opening Privacy Policy',
      text2: 'Privacy policy link will be available soon',
    });
  };

  const openTermsOfService = () => {
    Toast.show({
      type: 'info',
      text1: 'Opening Terms of Service',
      text2: 'Terms of service link will be available soon',
    });
  };

  const contactSupport = () => {
    Toast.show({
      type: 'info',
      text1: 'Contact Support',
      text2: 'Support contact will be available soon',
    });
  };

  const rateApp = () => {
    Toast.show({
      type: 'success',
      text1: 'Thank You!',
      text2: 'App store link will be available soon',
    });
  };

  const shareApp = () => {
    Toast.show({
      type: 'success',
      text1: 'Share AFRI-Plates',
      text2: 'Share functionality will be available soon',
    });
  };

  const getThemeDisplayText = () => {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System Default';
      default:
        return 'System Default';
    }
  };

  const renderSectionHeader = (title: string, icon: keyof typeof Ionicons.glyphMap) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
    </View>
  );

  const renderToggleItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    icon: keyof typeof Ionicons.glyphMap
  ) => (
    <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.settingItemLeft}>
        <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}20` }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? 'white' : colors.textMuted}
      />
    </View>
  );

  const renderNavigationItem = (
    title: string,
    description: string,
    onPress: () => void,
    icon: keyof typeof Ionicons.glyphMap,
    rightText?: string
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}20` }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>
        </View>
      </View>
      <View style={styles.settingItemRight}>
        {rightText && (
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{rightText}</Text>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  const renderActionItem = (
    title: string,
    onPress: () => void,
    icon: keyof typeof Ionicons.glyphMap,
    isDestructive?: boolean
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.settingIcon, { backgroundColor: isDestructive ? `${colors.error}20` : `${colors.primary}20` }]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={isDestructive ? colors.error : colors.primary} 
          />
        </View>
        <Text style={[
          styles.settingTitle, 
          { color: isDestructive ? colors.error : colors.textPrimary }
        ]}>
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        {renderSectionHeader('Appearance', 'color-palette-outline')}
        {renderNavigationItem(
          'Theme',
          'Choose your preferred theme mode',
          handleThemeSelection,
          'moon-outline',
          getThemeDisplayText()
        )}

        {/* Notifications */}
        {renderSectionHeader('Notifications', 'notifications-outline')}
        {renderToggleItem(
          'Push Notifications',
          'Receive notifications on your device',
          pushNotifications,
          setPushNotifications,
          'phone-portrait-outline'
        )}
        {renderToggleItem(
          'Email Notifications',
          'Receive important updates via email',
          emailNotifications,
          setEmailNotifications,
          'mail-outline'
        )}
        {renderToggleItem(
          'Recipe Reminders',
          'Get reminded about your meal plans',
          recipeReminders,
          setRecipeReminders,
          'alarm-outline'
        )}
        {renderToggleItem(
          'Social Notifications',
          'Likes, follows, and chef interactions',
          socialNotifications,
          setSocialNotifications,
          'people-outline'
        )}

        {/* Privacy & Security */}
        {renderSectionHeader('Privacy & Security', 'shield-outline')}
        {renderToggleItem(
          'Public Profile',
          'Make your profile visible to other users',
          profileVisibility,
          setProfileVisibility,
          'eye-outline'
        )}
        {renderToggleItem(
          'Share Activity',
          'Share your cooking activity with followers',
          shareActivity,
          setShareActivity,
          'share-outline'
        )}
        {renderToggleItem(
          'Analytics',
          'Help improve the app with usage analytics',
          analyticsOptIn,
          setAnalyticsOptIn,
          'analytics-outline'
        )}
        {renderNavigationItem(
          'Privacy Policy',
          'View our privacy policy',
          openPrivacyPolicy,
          'document-text-outline'
        )}
        {renderNavigationItem(
          'Terms of Service',
          'View terms and conditions',
          openTermsOfService,
          'contract-outline'
        )}

        {/* App Preferences */}
        {renderSectionHeader('App Preferences', 'options-outline')}
        {renderToggleItem(
          'Auto-play Videos',
          'Automatically play recipe videos',
          autoPlayVideos,
          setAutoPlayVideos,
          'play-outline'
        )}
        {renderToggleItem(
          'Offline Downloads',
          'Download recipes for offline viewing',
          offlineDownloads,
          setOfflineDownloads,
          'download-outline'
        )}
        {renderToggleItem(
          'High Quality Images',
          'Load images in higher resolution',
          highQualityImages,
          setHighQualityImages,
          'image-outline'
        )}
        {renderNavigationItem(
          'Language & Region',
          'Change app language and regional settings',
          handleLanguageSelection,
          'globe-outline',
          'English'
        )}

        {/* Data Management */}
        {renderSectionHeader('Data Management', 'server-outline')}
        {renderNavigationItem(
          'Storage & Data',
          'Manage app data and storage',
          handleDataManagement,
          'folder-outline'
        )}

        {/* About */}
        {renderSectionHeader('About', 'information-circle-outline')}
        {renderActionItem(
          'Rate AFRI-Plates',
          rateApp,
          'star-outline'
        )}
        {renderActionItem(
          'Share App',
          shareApp,
          'share-social-outline'
        )}
        {renderActionItem(
          'Contact Support',
          contactSupport,
          'help-circle-outline'
        )}

        {/* Account Info */}
        <View style={[styles.accountInfo, { backgroundColor: colors.surface }]}>
          <Text style={[styles.accountInfoTitle, { color: colors.textPrimary }]}>Account Information</Text>
          <Text style={[styles.accountInfoText, { color: colors.textSecondary }]}>
            Signed in as: {user?.email}
          </Text>
          <Text style={[styles.accountInfoText, { color: colors.textSecondary }]}>
            App Version: 1.0.0
          </Text>
        </View>

        {/* Spacer */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: ThemeConfig.fontSize.xxl,
    fontWeight: ThemeConfig.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    marginTop: ThemeConfig.spacing.md,
  },
  sectionTitle: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.semibold,
    marginLeft: ThemeConfig.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    marginHorizontal: ThemeConfig.spacing.lg,
    marginVertical: ThemeConfig.spacing.xs,
    borderRadius: ThemeConfig.borderRadius.medium,
    borderWidth: 1,
    ...ThemeConfig.shadows.small,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ThemeConfig.spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: ThemeConfig.fontSize.sm,
    lineHeight: 16,
  },
  settingValue: {
    fontSize: ThemeConfig.fontSize.sm,
    marginRight: ThemeConfig.spacing.sm,
  },
  accountInfo: {
    margin: ThemeConfig.spacing.lg,
    padding: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.medium,
  },
  accountInfoTitle: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.semibold,
    marginBottom: ThemeConfig.spacing.sm,
  },
  accountInfoText: {
    fontSize: ThemeConfig.fontSize.sm,
    marginBottom: ThemeConfig.spacing.xs,
  },
  bottomSpacing: {
    height: ThemeConfig.spacing.xxl,
  },
}); 