import axios from 'axios';
import config from '../../auth0-configuration';

// Set these values based on your Auth0 account
const domain = config.domain;
const clientId = config.clientId;
const audience = config.audience;

// Function to get the Management API token
const getManagementApiToken = async () => {
  try {
    const response = await axios.post(
      `https://${domain}/oauth/token`,
      {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: process.env.AUTH0_CLIENT_SECRET, // This should be securely stored
        audience: `https://${domain}/api/v2/`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Management API token:', error);
    throw error;
  }
};

// Function to fetch user roles
export const fetchUserRoles = async (userId: string, accessToken: string) => {
  try {
    // For React Native, we'll use a different approach than the web app
    // Instead of directly calling Auth0 Management API (which requires client credentials),
    // we'll use the user's access token to call our backend which can fetch the roles
    
    // Create a separate header for this request
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    // This would be an endpoint on your backend that proxies the Auth0 Management API
    // You would need to implement this endpoint on your backend
    const response = await axios.get(
      `https://government-webapp-backend-fb660c5890cb.herokuapp.com/api/user-roles/${userId}`,
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
};

export default { fetchUserRoles };