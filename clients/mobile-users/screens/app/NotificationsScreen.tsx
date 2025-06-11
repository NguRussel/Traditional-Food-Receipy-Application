import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ThemeConfig } from '../../constants/Colors';
import Toast from 'react-native-toast-message';

interface Notification {
  id: string;
  type: 'recipe_liked' | 'new_follower' | 'chef_reply' | 'new_recipe' | 'meal_reminder' | 'account_warning' | 'system_announcement';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: {
    recipeId?: string;
    chefId?: string;
    userId?: string;
  };
}

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  recipeUpdates: boolean;
  chefUpdates: boolean;
  mealReminders: boolean;
  socialInteractions: boolean;
  systemAnnouncements: boolean;
  marketingEmails: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'new_recipe',
    title: 'New Recipe from Chef Mama Ngozi',
    message: 'Traditional Ndolé recipe has been shared by your followed chef',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: false,
    priority: 'medium',
    data: { chefId: 'chef1', recipeId: 'recipe1' },
  },
  {
    id: '2',
    type: 'recipe_liked',
    title: 'Recipe Appreciation',
    message: '15 people liked your Achu Soup recipe!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    priority: 'low',
    data: { recipeId: 'recipe2' },
  },
  {
    id: '3',
    type: 'meal_reminder',
    title: 'Cooking Reminder',
    message: "Time to prepare tonight's dinner - Poulet DG is on your meal plan",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    isRead: true,
    priority: 'high',
  },
  {
    id: '4',
    type: 'new_follower',
    title: 'New Follower',
    message: 'Sarah from Douala started following you',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
    priority: 'low',
    data: { userId: 'user1' },
  },
  {
    id: '5',
    type: 'chef_reply',
    title: 'Chef Response',
    message: 'Chef Papa Boniface replied to your review on Koki recipe',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    isRead: true,
    priority: 'medium',
    data: { chefId: 'chef2', recipeId: 'recipe3' },
  },
  {
    id: '6',
    type: 'system_announcement',
    title: 'New Feature: AI Assistant',
    message: 'Discover our new AI cooking assistant to help with your Cameroonian recipes',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    isRead: true,
    priority: 'medium',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    recipeUpdates: true,
    chefUpdates: true,
    mealReminders: true,
    socialInteractions: true,
    systemAnnouncements: true,
    marketingEmails: false,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    const iconMap = {
      recipe_liked: 'heart',
      new_follower: 'person-add',
      chef_reply: 'chatbubble',
      new_recipe: 'restaurant',
      meal_reminder: 'alarm',
      account_warning: 'warning',
      system_announcement: 'megaphone',
    };
    return iconMap[type] || 'notifications';
  };

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'urgent') return Colors.light.error;
    if (priority === 'high') return Colors.light.warning;
    
    const colorMap = {
      recipe_liked: Colors.light.error,
      new_follower: Colors.light.info,
      chef_reply: Colors.light.primary,
      new_recipe: Colors.light.success,
      meal_reminder: Colors.light.warning,
      account_warning: Colors.light.error,
      system_announcement: Colors.light.info,
    };
    return colorMap[type] || Colors.light.textSecondary;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMilliseconds = now.getTime() - timestamp.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return timestamp.toLocaleDateString();
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    Toast.show({
      type: 'success',
      text1: 'All notifications marked as read',
    });
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
            Toast.show({
              type: 'success',
              text1: 'All notifications cleared',
            });
          },
        },
      ]
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    Toast.show({
      type: 'success',
      text1: 'Notification deleted',
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call to fetch new notifications
    setTimeout(() => {
      setRefreshing(false);
      Toast.show({
        type: 'success',
        text1: 'Notifications updated',
      });
    }, 1000);
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          <Ionicons
            name={getNotificationIcon(item.type) as keyof typeof Ionicons.glyphMap}
            size={20}
            color={getNotificationColor(item.type, item.priority)}
          />
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationTitleRow}>
            <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>
              {item.title}
            </Text>
            {item.priority === 'urgent' && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>URGENT</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.notificationMessage}>{item.message}</Text>
          
          <View style={styles.notificationFooter}>
            <Text style={styles.notificationTime}>{formatTimeAgo(item.timestamp)}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Ionicons name="close" size={16} color={Colors.light.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>Notification Preferences</Text>
      
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>General</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Receive notifications on your device</Text>
          </View>
          <Switch
            value={settings.pushNotifications}
            onValueChange={() => toggleSetting('pushNotifications')}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Text style={styles.settingDescription}>Receive important updates via email</Text>
          </View>
          <Switch
            value={settings.emailNotifications}
            onValueChange={() => toggleSetting('emailNotifications')}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Content Updates</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>New Recipes</Text>
            <Text style={styles.settingDescription}>When chefs you follow share new recipes</Text>
          </View>
          <Switch
            value={settings.recipeUpdates}
            onValueChange={() => toggleSetting('recipeUpdates')}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Chef Updates</Text>
            <Text style={styles.settingDescription}>Updates from your followed chefs</Text>
          </View>
          <Switch
            value={settings.chefUpdates}
            onValueChange={() => toggleSetting('chefUpdates')}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Personal</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Meal Reminders</Text>
            <Text style={styles.settingDescription}>Cooking reminders for your meal plans</Text>
          </View>
          <Switch
            value={settings.mealReminders}
            onValueChange={() => toggleSetting('mealReminders')}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Social Interactions</Text>
            <Text style={styles.settingDescription}>Likes, follows, and comments on your content</Text>
          </View>
          <Switch
            value={settings.socialInteractions}
            onValueChange={() => toggleSetting('socialInteractions')}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>System & Marketing</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>System Announcements</Text>
            <Text style={styles.settingDescription}>Important app updates and features</Text>
          </View>
          <Switch
            value={settings.systemAnnouncements}
            onValueChange={() => toggleSetting('systemAnnouncements')}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Marketing Emails</Text>
            <Text style={styles.settingDescription}>Promotional content and special offers</Text>
          </View>
          <Switch
            value={settings.marketingEmails}
            onValueChange={() => toggleSetting('marketingEmails')}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.tabButton, !showSettings && styles.activeTabButton]}
            onPress={() => setShowSettings(false)}
          >
            <Text style={[styles.tabButtonText, !showSettings && styles.activeTabButtonText]}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, showSettings && styles.activeTabButton]}
            onPress={() => setShowSettings(true)}
          >
            <Text style={[styles.tabButtonText, showSettings && styles.activeTabButtonText]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        {!showSettings && (
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.actionButton} onPress={markAllAsRead}>
                <Ionicons name="checkmark-done" size={20} color={Colors.light.primary} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.actionButton} onPress={clearAllNotifications}>
              <Ionicons name="trash-outline" size={20} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {showSettings ? (
        <FlatList
          data={[{ key: 'settings' }]}
          renderItem={renderSettings}
          style={styles.settingsList}
        />
      ) : (
        <>
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-outline" size={80} color={Colors.light.textMuted} />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyDescription}>
                You're all caught up! New notifications will appear here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={renderNotification}
              style={styles.notificationsList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors.light.primary]}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  headerLeft: {
    flexDirection: 'row',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.md,
    paddingVertical: ThemeConfig.spacing.sm,
    borderRadius: ThemeConfig.borderRadius.medium,
    marginRight: ThemeConfig.spacing.sm,
  },
  activeTabButton: {
    backgroundColor: Colors.light.primary,
  },
  tabButtonText: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: Colors.light.textPrimary,
  },
  activeTabButtonText: {
    color: 'white',
  },
  badge: {
    backgroundColor: Colors.light.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: ThemeConfig.spacing.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.xs,
    fontWeight: ThemeConfig.fontWeight.bold,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: ThemeConfig.spacing.sm,
    marginLeft: ThemeConfig.spacing.sm,
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: ThemeConfig.spacing.lg,
  },
  notificationCard: {
    backgroundColor: Colors.light.card,
    borderRadius: ThemeConfig.borderRadius.medium,
    marginVertical: ThemeConfig.spacing.xs,
    ...ThemeConfig.shadows.small,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    padding: ThemeConfig.spacing.md,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ThemeConfig.spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.xs,
  },
  notificationTitle: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: Colors.light.textPrimary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: ThemeConfig.fontWeight.semibold,
  },
  urgentBadge: {
    backgroundColor: Colors.light.error,
    paddingHorizontal: ThemeConfig.spacing.sm,
    paddingVertical: 2,
    borderRadius: ThemeConfig.borderRadius.small,
  },
  urgentText: {
    color: 'white',
    fontSize: ThemeConfig.fontSize.xs,
    fontWeight: ThemeConfig.fontWeight.bold,
  },
  notificationMessage: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: ThemeConfig.spacing.sm,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTime: {
    fontSize: ThemeConfig.fontSize.xs,
    color: Colors.light.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  deleteButton: {
    padding: ThemeConfig.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.xl,
  },
  emptyTitle: {
    fontSize: ThemeConfig.fontSize.xl,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginTop: ThemeConfig.spacing.lg,
    marginBottom: ThemeConfig.spacing.sm,
  },
  emptyDescription: {
    fontSize: ThemeConfig.fontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  settingsList: {
    flex: 1,
  },
  settingsContainer: {
    padding: ThemeConfig.spacing.lg,
  },
  settingsTitle: {
    fontSize: ThemeConfig.fontSize.xl,
    fontWeight: ThemeConfig.fontWeight.bold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.xl,
  },
  settingsSection: {
    marginBottom: ThemeConfig.spacing.xl,
  },
  sectionTitle: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.semibold,
    color: Colors.light.textPrimary,
    marginBottom: ThemeConfig.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: ThemeConfig.spacing.md,
    borderRadius: ThemeConfig.borderRadius.medium,
    marginBottom: ThemeConfig.spacing.sm,
    ...ThemeConfig.shadows.small,
  },
  settingInfo: {
    flex: 1,
    marginRight: ThemeConfig.spacing.md,
  },
  settingLabel: {
    fontSize: ThemeConfig.fontSize.md,
    fontWeight: ThemeConfig.fontWeight.medium,
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: ThemeConfig.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
}); 