import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../auth0-configuration';
import { Platform } from 'react-native';

/**
 * Service for handling Auth0 user roles, mirroring the web application's implementation
 */
class Auth0RolesService {
  // The token used to access the Auth0 Management API
  private managementToken: string | null = null;

  /**
   * Get a token for the Auth0 Management API
   * Note: In a production app, this should come from a backend proxy for security
   */
  private async getManagementToken(): Promise<string> {
    try {
      // Try to get cached token first
      const cachedToken = await AsyncStorage.getItem('@auth0_management_token');
      if (cachedToken) {
        return cachedToken;
      }
      
      // If no cached token, fetch a new one using the proper client credentials
      console.log('Fetching new Management API token');
      
      const audience = `https://${config.domain}/api/v2/`;
      const tokenResponse = await fetch(`https://${config.domain}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: config.managementClientId,  // Using the API Explorer Application client ID
          client_secret: config.clientSecret,     // Using the proper client secret
          audience: audience,
          grant_type: 'client_credentials',
        }),
      });
      
      if (!tokenResponse.ok) {
        throw new Error(`Failed to get Management API token: ${tokenResponse.status}`);
      }
      
      const tokenData = await tokenResponse.json();
      this.managementToken = tokenData.access_token;
      
      // Cache the token
      await AsyncStorage.setItem('@auth0_management_token', this.managementToken);
      
      return this.managementToken;
    } catch (error) {
      console.error('Error getting Management API token:', error);
      throw error;
    }
  }
  
  /**
   * Fetch user roles from Auth0, similar to the web application's implementation
   */
  async getUserRoles(userId: string, userAccessToken: string): Promise<string[]> {
    try {
      console.log(`Fetching roles for user ID: ${userId}`);
      
      // First try using the user's access token if it has the right scope
      try {
        const response = await fetch(`https://${config.domain}/api/v2/users/${userId}/roles`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userAccessToken}`,
          },
        });
        
        if (response.ok) {
          const roles = await response.json();
          console.log('Successfully fetched user roles with user token:', roles);
          const roleNames = roles.map((role: any) => role.name);
          
          // If no roles are assigned, assign the default registered user role
          if (roleNames.length === 0) {
            console.log('No roles assigned, returning default registered user role');
            return ['a_Registered_User'];
          }
          
          return roleNames;
        } else {
          console.log('User token does not have sufficient permissions, status:', response.status);
        }
      } catch (error) {
        console.log('Error fetching roles with user token:', error);
      }
      
      // If user token didn't work, try with Management API token
      try {
        const token = await this.getManagementToken();
        const response = await fetch(`https://${config.domain}/api/v2/users/${userId}/roles`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const roles = await response.json();
          console.log('Successfully fetched user roles with Management API token:', roles);
          const roleNames = roles.map((role: any) => role.name);
          
          // If no roles are assigned, assign the default registered user role
          if (roleNames.length === 0) {
            console.log('No roles assigned, returning default registered user role');
            return ['a_Registered_User'];
          }
          
          return roleNames;
        } else {
          console.log('Failed to fetch roles with Management API token, status:', response.status);
          // Return default role even on error to prevent endless retries
          console.log('Returning default registered user role due to error');
          return ['a_Registered_User'];
        }
      } catch (error) {
        console.log('Error fetching roles with Management API token:', error);
        // Return default role even on error to prevent endless retries
        console.log('Returning default registered user role due to error');
        return ['a_Registered_User'];
      }
    } catch (error) {
      console.error('Error in getUserRoles:', error);
      
      // For development/testing only - assign roles based on email
      // For all other cases, return the default registered user role
      if (userId.includes('fung.yuri.intern@gmail.com')) {
        console.log('Using test admin role for:', userId);
        return ['e_admin_portal'];
      }
      
      console.log('Returning default registered user role due to error');
      return ['a_Registered_User'];
    }
  }
}

export default new Auth0RolesService();