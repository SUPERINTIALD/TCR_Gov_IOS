import AsyncStorage from '@react-native-async-storage/async-storage';
import { Auth0Client } from 'react-native-auth0';
import config from '../../auth0-configuration';
import { setAuthToken } from '../api/apiClient';

// Create Auth0 client
const auth0 = new Auth0Client({
  domain: config.domain,
  clientId: config.clientId
});

/**
 * Service to handle Auth0 authentication flows, similar to the web implementation
 */
class AuthService {
  /**
   * Completely sign out a user and clear all Auth0 session data
   * This uses a simplified approach based on the web app implementation
   */
  async logout() {
    try {
      console.log('Starting logout process...');
      
      // First clear the API auth token
      setAuthToken('');
      console.log('API auth token cleared');
      
      // Clear local storage tokens
      await this.clearLoginState();
      console.log('Local storage cleared');
      
      try {
        // Use the more direct federated logout approach
        await auth0.clearSession({federated: true});
        console.log('Auth0 session cleared successfully');
      } catch (sessionError) {
        // Even if Auth0 session clearing fails, we've already cleared local tokens
        console.log('Auth0 session clearing had an issue:', sessionError);
        console.log('But local tokens were successfully cleared');
      }
      
      console.log('Logout completed');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      
      // Ensure local tokens are removed even if other logout steps fail
      try {
        await this.clearLoginState();
      } catch (clearError) {
        console.error('Failed to clear local state during error handling', clearError);
      }
      
      return false;
    }
  }

  /**
   * Clear all authentication state from the device
   * Enhanced to be more thorough
   */
  async clearLoginState() {
    try {
      // Clear all Auth0-related items from storage
      const keysToRemove = [
        '@auth_access_token',
        '@auth_id_token',
        '@auth_refresh_token',
        '@auth_clear_session',
        '@auth_user_data',
        '@auth_credentials',
        '@auth0.session',
      ];
      
      await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));
      
      // Also clear any Auth0 web storage items
      if (global.localStorage) {
        global.localStorage.removeItem('auth0.is.authenticated');
        global.localStorage.removeItem('auth0.credentials');
      }
      
      console.log('Login state cleared completely from device');
      return true;
    } catch (error) {
      console.error('Failed to clear login state:', error);
      return false;
    }
  }
}

export default AuthService;