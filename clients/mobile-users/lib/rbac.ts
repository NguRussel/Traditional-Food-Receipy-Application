// AFRI-Plates Role-Based Access Control (RBAC) System
import { UserRole, UserPermissions } from './supabase';

// Default permissions for each role
export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  user: {
    // User permissions
    view_recipes: true,
    save_favorites: true,
    create_reviews: true,
    follow_chefs: true,
    
    // Chef permissions (denied)
    create_recipe: false,
    edit_recipe: false,
    delete_own_recipe: false,
    reply_to_reviews: false,
    view_analytics: false,
    manage_profile: true, // Users can manage their own profile
    
    // Admin permissions (denied)
    approve_recipes: false,
    moderate_content: false,
    manage_users: false,
    verify_chefs: false,
    view_all_analytics: false,
    system_settings: false,
    ban_users: false,
  },
  
  chef: {
    // User permissions (inherited)
    view_recipes: true,
    save_favorites: true,
    create_reviews: true,
    follow_chefs: true,
    
    // Chef permissions
    create_recipe: true,
    edit_recipe: true,
    delete_own_recipe: true,
    reply_to_reviews: true,
    view_analytics: true,
    manage_profile: true,
    
    // Admin permissions (denied)
    approve_recipes: false,
    moderate_content: false,
    manage_users: false,
    verify_chefs: false,
    view_all_analytics: false,
    system_settings: false,
    ban_users: false,
  },
  
  admin: {
    // User permissions (inherited)
    view_recipes: true,
    save_favorites: true,
    create_reviews: true,
    follow_chefs: true,
    
    // Chef permissions (inherited)
    create_recipe: true,
    edit_recipe: true,
    delete_own_recipe: true,
    reply_to_reviews: true,
    view_analytics: true,
    manage_profile: true,
    
    // Admin permissions
    approve_recipes: true,
    moderate_content: true,
    manage_users: true,
    verify_chefs: true,
    view_all_analytics: true,
    system_settings: true,
    ban_users: true,
  },
};

// Permission checker functions
export class RBACManager {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(
    userRole: UserRole, 
    userPermissions: UserPermissions | null, 
    permission: keyof UserPermissions
  ): boolean {
    // Use custom permissions if available, otherwise use default
    const permissions = userPermissions || DEFAULT_PERMISSIONS[userRole];
    return permissions[permission];
  }

  /**
   * Check if user can access a specific resource
   */
  static canAccessResource(
    userRole: UserRole,
    userPermissions: UserPermissions | null,
    resource: string,
    action: string
  ): boolean {
    const permissionKey = `${action}_${resource}` as keyof UserPermissions;
    return this.hasPermission(userRole, userPermissions, permissionKey);
  }

  /**
   * Get all permissions for a role
   */
  static getPermissionsForRole(role: UserRole): UserPermissions {
    return DEFAULT_PERMISSIONS[role];
  }

  /**
   * Check if user can perform recipe actions
   */
  static canManageRecipe(
    userRole: UserRole,
    userPermissions: UserPermissions | null,
    recipeOwnerId: string,
    currentUserId: string,
    action: 'create' | 'edit' | 'delete' | 'approve'
  ): boolean {
    switch (action) {
      case 'create':
        return this.hasPermission(userRole, userPermissions, 'create_recipe');
      
      case 'edit':
        // Own recipe or admin
        return (
          (recipeOwnerId === currentUserId && this.hasPermission(userRole, userPermissions, 'edit_recipe')) ||
          this.hasPermission(userRole, userPermissions, 'moderate_content')
        );
      
      case 'delete':
        // Own recipe or admin
        return (
          (recipeOwnerId === currentUserId && this.hasPermission(userRole, userPermissions, 'delete_own_recipe')) ||
          this.hasPermission(userRole, userPermissions, 'moderate_content')
        );
      
      case 'approve':
        return this.hasPermission(userRole, userPermissions, 'approve_recipes');
      
      default:
        return false;
    }
  }

  /**
   * Check if user can manage other users
   */
  static canManageUser(
    userRole: UserRole,
    userPermissions: UserPermissions | null,
    targetUserId: string,
    currentUserId: string,
    action: 'view' | 'edit' | 'ban' | 'verify'
  ): boolean {
    switch (action) {
      case 'view':
        // Anyone can view public profiles, admins can view all
        return true;
      
      case 'edit':
        // Own profile or admin
        return (
          targetUserId === currentUserId ||
          this.hasPermission(userRole, userPermissions, 'manage_users')
        );
      
      case 'ban':
        return this.hasPermission(userRole, userPermissions, 'ban_users');
      
      case 'verify':
        return this.hasPermission(userRole, userPermissions, 'verify_chefs');
      
      default:
        return false;
    }
  }

  /**
   * Get allowed screens/routes for a role
   */
  static getAllowedRoutes(userRole: UserRole): string[] {
    const baseRoutes = [
      'Home',
      'Search',
      'RecipeDetail',
      'Profile',
      'Settings',
      'Favorites',
    ];

    const chefRoutes = [
      'CreateRecipe',
      'MyRecipes',
      'Analytics',
      'ChefProfile',
    ];

    const adminRoutes = [
      'AdminDashboard',
      'UserManagement',
      'ContentModeration',
      'SystemSettings',
      'Analytics',
    ];

    switch (userRole) {
      case 'admin':
        return [...baseRoutes, ...chefRoutes, ...adminRoutes];
      case 'chef':
        return [...baseRoutes, ...chefRoutes];
      case 'user':
      default:
        return baseRoutes;
    }
  }

  /**
   * Check if user can access a specific screen
   */
  static canAccessScreen(userRole: UserRole, screenName: string): boolean {
    const allowedRoutes = this.getAllowedRoutes(userRole);
    return allowedRoutes.includes(screenName);
  }

  /**
   * Get user role hierarchy level (for comparison)
   */
  static getRoleLevel(role: UserRole): number {
    const levels = { user: 1, chef: 2, admin: 3 };
    return levels[role] || 0;
  }

  /**
   * Check if user role is higher than or equal to required role
   */
  static hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
    return this.getRoleLevel(userRole) >= this.getRoleLevel(requiredRole);
  }
}

export default RBACManager; 