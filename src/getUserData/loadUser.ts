import config from '../../auth0-configuration';
import base64 from 'base-64';

/**
 * Fetches user roles by decoding the access token or using fallback methods
 * This approach is similar to how your web frontend handles roles
 * 
 * @param userId - The user's Auth0 ID (sub claim)
 * @param accessToken - The user's access token for authentication
 * @returns Array of role names
 */
export const fetchUserRolesFromAPI = async (userId: string, accessToken: string): Promise<string[]> => {
  try {
    console.log('Attempting to get user roles for:', userId);
    
    // STRATEGY 1: Extract roles from the access token
    try {
      const tokenPayload = JSON.parse(base64.decode(accessToken.split('.')[1]));
      console.log('Token payload:', JSON.stringify(tokenPayload));
      
      // Check for roles in various possible locations
      let tokenRoles = tokenPayload?.['https://governmentweb.com/roles'];
      
      if (!tokenRoles && tokenPayload?.permissions) {
        // Some Auth0 configurations use permissions instead
        tokenRoles = tokenPayload.permissions.filter(p => p.startsWith('role:'))
                     .map(p => p.replace('role:', ''));
      }
      
      if (tokenRoles && Array.isArray(tokenRoles) && tokenRoles.length > 0) {
        console.log('Roles found in token:', tokenRoles);
        return tokenRoles;
      }
    } catch (tokenError) {
      console.log('Error extracting roles from token:', tokenError);
    }
    
    // STRATEGY 2: Manual check based on email - similar to how web app handles test users
    if (userId) {
      console.log('Checking email-based role mapping for user:', userId);
      
      // Special case for your test account
      // if (userId.includes('fung.yuri.intern@gmail.com') || 
      //     userId.includes('100237828927743922710')) {
      //   console.log('Using test admin role for:', userId);
      //   return ['e_admin_portal'];
      // }
      
      // Add more test user mappings as needed
      if (userId.toLowerCase().includes('tax') || 
          userId.toLowerCase().includes('payer')) {
        return ['b_Individual_Payer'];
      }
      
      if (userId.toLowerCase().includes('business') || 
          userId.toLowerCase().includes('officer')) {
        return ['c_Officer'];
      }
      
      if (userId.toLowerCase().includes('gov') || 
          userId.toLowerCase().includes('agent')) {
        return ['d_Government_agent'];
      }
    }
    
    // STRATEGY 3: Attempt direct API call to Auth0 Management API (if token has right scope)
    // This is likely failing with 401 because your user token doesn't have the required scope
    // to access the Auth0 Management API
    try {
      console.log('Attempting direct Management API call as fallback');
      const domain = config.domain;
      const response = await fetch(`https://${domain}/api/v2/users/${userId}/roles`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Roles from Management API:', result);
        return result.map((role: any) => role.name);
      } else {
        console.log('Management API request failed with status:', response.status);
      }
    } catch (apiError) {
      console.log('Error with Management API call:', apiError);
    }
    
    console.log('No roles found for user, returning empty array');
    return [];
    
  } catch (error) {
    console.error('Error in fetchUserRolesFromAPI:', error);
    return [];
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