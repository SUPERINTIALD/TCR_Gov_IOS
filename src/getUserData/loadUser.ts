import config from '../../auth0-configuration';
import base64 from 'base-64';
import Auth0RolesService from '../services/Auth0RolesService';

/**
 * Fetches user roles from Auth0, similar to how the web app does it
 * 
 * @param userId - The user's Auth0 ID (sub claim)
 * @param accessToken - The user's access token for authentication
 * @returns Array of role names
 */
export const fetchUserRolesFromAPI = async (userId: string, accessToken: string): Promise<string[]> => {
  try {
    console.log('Fetching roles for user:', userId);
    
    // Use our dedicated Auth0RolesService to get user roles
    const roles = await Auth0RolesService.getUserRoles(userId, accessToken);
    
    // Auth0RolesService should always return at least ['a_Registered_User'] when no roles found
    // This prevents retry loops and ensures consistent behavior
    if (roles && roles.length > 0) {
      console.log('Roles returned from Auth0RolesService:', roles);
      return roles;
    }
    
    // This is a fallback that should never be reached since Auth0RolesService will always return at least one role
    console.log('Unexpected empty roles array, returning default registered user role');
    return ['a_Registered_User'];
  } catch (error) {
    console.error('Error in fetchUserRolesFromAPI:', error);
    
    // Development fallback
    if (userId.includes('fung.yuri.intern@gmail.com')) {
      console.log('Using test admin role as fallback after error');
      return ['e_admin_portal'];
    }
    
    // Return default registered user role to prevent retry loops
    return ['a_Registered_User'];
  }
};

/**
 * Helper function to parse a JWT token and extract the payload
 */
export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64Str = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      base64.decode(base64Str)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return {};
  }
};