import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, ThemeConfig } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

const menuItems = [
  {
    id: 'favorites',
    title: 'My Favorites',
    icon: 'heart-outline',
    color: Colors.light.primary,
  },
  {
    id: 'edit-profile',
    title: 'Edit Profile',
    icon: 'person-outline',
    color: Colors.light.primary,
  },
  {
    id: 'preferences',
    title: 'Cooking Preferences',
    icon: 'options-outline',
    color: Colors.light.primary,
  },
  {
    id: 'meal-planner',
    title: 'Meal Planner',
    icon: 'calendar-outline',
    color: Colors.light.primary,
  },
  {
    id: 'my-reviews',
    title: 'My Reviews',
    icon: 'star-outline',
    color: Colors.light.primary,
  },
];

const settingsItems = [
  {
    id: 'settings',
    title: 'App Settings',
    icon: 'settings-outline',
    color: Colors.light.textSecondary,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'notifications-outline',
    color: Colors.light.textSecondary,
  },
  {
    id: 'account-management',
    title: 'Account Management',
    icon: 'person-circle-outline',
    color: Colors.light.warning,
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    icon: 'shield-outline',
    color: Colors.light.textSecondary,
  },
  {
    id: 'language',
    title: 'Language & Region',
    icon: 'globe-outline',
    color: Colors.light.textSecondary,
  },
  {
    id: 'help',
    title: 'Help & Support',
    icon: 'help-circle-outline',
    color: Colors.light.textSecondary,
  },
  {
    id: 'about',
    title: 'About AFRI-Plates',
    icon: 'information-circle-outline',
    color: Colors.light.textSecondary,
  },
];

export default function ProfileScreen() {
  const { user, signOut, updateProfilePhoto } = useAuth();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleEditPhoto = () => {
    Alert.alert(
      '📸 Change Profile Photo',
      'Choose how you want to update your profile photo',
      [
        {
          text: 'Take Photo',
          onPress: openCamera,
        },
        {
          text: 'Choose from Gallery',
          onPress: openGallery,
        },
        {
          text: 'Remove Photo',
          style: 'destructive',
          onPress: removePhoto,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'Please grant camera permissions to take photos',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Camera Error',
        text2: 'Failed to open camera. Please try again.',
      });
    }
  };

  const openGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'Please grant photo library permissions',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Gallery Error',
        text2: 'Failed to open photo gallery. Please try again.',
      });
    }
  };

  const uploadProfilePhoto = async (uri: string) => {
    setIsUploadingPhoto(true);
    
    try {
      Toast.show({
        type: 'info',
        text1: '📤 Uploading',
        text2: 'Updating your profile photo...',
      });

      const { error, url } = await updateProfilePhoto(uri);

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Upload Failed',
          text2: error.message || 'Failed to update profile photo',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: '✅ Photo Updated',
          text2: 'Your profile photo has been updated successfully!',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const removePhoto = async () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsUploadingPhoto(true);
            try {
              const { error } = await updateProfilePhoto('');
              if (error) {
                Toast.show({
                  type: 'error',
                  text1: 'Remove Failed',
                  text2: 'Failed to remove profile photo',
                });
              } else {
                Toast.show({
                  type: 'success',
                  text1: 'Photo Removed',
                  text2: 'Profile photo has been removed',
                });
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to remove photo',
              });
            } finally {
              setIsUploadingPhoto(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Toast.show({
                type: 'error',
                text1: 'Sign Out Failed',
                text2: error.message,
              });
            }
          },
        },
      ]
    );
  };

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case 'favorites':
        // Navigate to favorites
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Favorites screen will be available soon',
        });
        break;
      case 'edit-profile':
        // Navigate to edit profile
        Toast.show({
          type: 'success',
          text1: '✏️ Edit Profile',
          text2: 'Edit profile screen is now available!',
        });
        break;
      case 'preferences':
        // Navigate to cooking preferences
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Cooking preferences feature will be available soon',
        });
        break;
      case 'meal-planner':
        // Navigate to meal planner
        Toast.show({
          type: 'success',
          text1: 'Meal Planner',
          text2: 'Meal planner screen is now available!',
        });
        break;
      case 'my-reviews':
        // Navigate to user reviews
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'My reviews feature will be available soon',
        });
        break;
      case 'notifications':
        // Navigate to notifications settings
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Notification settings will be available soon',
        });
        break;
      case 'settings':
        // Navigate to settings screen
        Toast.show({
          type: 'success',
          text1: 'Settings',
          text2: 'Settings screen is now available!',
        });
        break;
      case 'account-management':
        // Navigate to account management screen
        Toast.show({
          type: 'success',
          text1: 'Account Management',
          text2: 'Account management screen is now available!',
        });
        break;
      case 'privacy':
        // Navigate to privacy settings
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Privacy settings will be available soon',
        });
        break;
      case 'language':
        // Navigate to language settings
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Language settings will be available soon',
        });
        break;
      case 'help':
        // Navigate to help
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Help & support will be available soon',
        });
        break;
      case 'about':
        // Navigate to about
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'About page will be available soon',
        });
        break;
      default:
        break;
    }
  };

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuPress(item.id)}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon as any} size={20} color={item.color} />
        </View>
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
    </TouchableOpacity>
  );

  const renderSettingsItem = (item: typeof settingsItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuPress(item.id)}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon as any} size={20} color={item.color} />
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={Colors.light.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {user?.user_metadata?.avatar_url || user?.user_metadata?.profile_photo ? (
                <Image 
                  source={{ uri: user.user_metadata.avatar_url || user.user_metadata.profile_photo }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={40} color={Colors.light.textMuted} />
              )}
              {isUploadingPhoto && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="white" />
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={handleEditPhoto}
              disabled={isUploadingPhoto}
            >
              <Ionicons 
                name={isUploadingPhoto ? "sync" : "camera"} 
                size={16} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>
            {user?.user_metadata?.full_name || 'Food Lover'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Recipes Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Recipes Cooked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Chefs Following</Text>
            </View>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Kitchen</Text>
          <View style={styles.menuContainer}>
            {menuItems.map(renderMenuItem)}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuContainer}>
            {settingsItems.map(renderSettingsItem)}
          </View>
        </View>

        {/* Chef Application */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.chefApplicationCard}>
            <View style={styles.chefApplicationIcon}>
              <Ionicons name="restaurant" size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.chefApplicationContent}>
              <Text style={styles.chefApplicationTitle}>Become a Chef</Text>
              <Text style={styles.chefApplicationDescription}>
                Share your culinary expertise and inspire others with your recipes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.light.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>AFRI-Plates v1.0.0</Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: ThemeConfig.fontSize.xxl,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: Colors.light.textPrimary,
  },
  settingsButton: {
    padding: ThemeConfig.spacing.sm,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: ThemeConfig.spacing.xl,
    backgroundColor: Colors.light.card,
    marginHorizontal: ThemeConfig.spacing.lg,
    marginVertical: ThemeConfig.spacing.lg,
    borderRadius: ThemeConfig.borderRadius.large,
    ...ThemeConfig.shadows.medium,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: ThemeConfig.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  userName: {
    fontSize: ThemeConfig.fontSize.xl,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.xs,
  },
  userEmail: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textSecondary,
    marginBottom: ThemeConfig.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
  },
  statNumber: {
    fontSize: ThemeConfig.fontSize.xl,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: ThemeConfig.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.light.border,
  },
  section: {
    marginBottom: ThemeConfig.spacing.xl,
  },
  sectionTitle: {
    fontSize: ThemeConfig.fontSize.lg,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.md,
    paddingHorizontal: ThemeConfig.spacing.lg,
  },
  menuContainer: {
    backgroundColor: Colors.light.card,
    marginHorizontal: ThemeConfig.spacing.lg,
    borderRadius: ThemeConfig.borderRadius.medium,
    ...ThemeConfig.shadows.small,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ThemeConfig.spacing.md,
  },
  menuItemText: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textPrimary,
    fontWeight: ThemeConfig.fontWeight.medium,
  },
  chefApplicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    marginHorizontal: ThemeConfig.spacing.lg,
    borderRadius: ThemeConfig.borderRadius.medium,
    padding: ThemeConfig.spacing.md,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: 'dashed',
  },
  chefApplicationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ThemeConfig.spacing.md,
  },
  chefApplicationContent: {
    flex: 1,
  },
  chefApplicationTitle: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.xs,
  },
  chefApplicationDescription: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.card,
    marginHorizontal: ThemeConfig.spacing.lg,
    borderRadius: ThemeConfig.borderRadius.medium,
    paddingVertical: ThemeConfig.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  signOutText: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.error,
    fontWeight: ThemeConfig.fontWeight.medium,
    marginLeft: ThemeConfig.spacing.sm,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: ThemeConfig.spacing.md,
  },
  versionText: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textMuted,
  },
  bottomSpacing: {
    height: ThemeConfig.spacing.xl,
  },
}); 