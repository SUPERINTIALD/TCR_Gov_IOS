import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { submitActivation, setAuthToken, checkBackendConnection } from '../api/apiClient';

const ActivateRoleScreen = () => {
  const navigation = useNavigation();
  const { user, getCredentials } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string | null>(null);

  // Ensure we have a valid token when screen loads and check backend connectivity
  useEffect(() => {
    const setupAndCheck = async () => {
      try {
        setIsLoading(true);
        
        // Check backend connectivity first
        console.log("Checking backend connection...");
        const connectionStatus = await checkBackendConnection();
        if (connectionStatus.status === 200) {
          setBackendStatus('Connected');
          console.log("Successfully connected to backend at http://192.168.0.60:6060");
        } else {
          setBackendStatus(`Error: ${connectionStatus.status}`);
          console.error("Backend connection failed:", connectionStatus.error);
        }
        
        // Then setup authentication token
        const credentials = await getCredentials();
        if (credentials?.accessToken) {
          setAuthToken(credentials.accessToken);
          setTokenError(null);
        } else {
          setTokenError('No access token available');
        }
      } catch (error) {
        console.error('Setup error:', error);
        setTokenError('Failed to get access token');
        setBackendStatus('Connection error');
      } finally {
        setIsLoading(false);
      }
    };

    setupAndCheck();
  }, [getCredentials]);

  const roles = [
    { id: 'tax_payer', name: 'Individual Tax Payer' },
    { id: 'business_officer', name: 'Business Officer' },
    { id: 'government_agent', name: 'Government Agent' },
  ];

  const handleRoleActivation = async (roleId: string, roleName: string) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to request role activation');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get fresh token for authorization
      const credentials = await getCredentials();
      if (!credentials?.accessToken) {
        throw new Error('No access token available');
      }
      
      // Set token for API request
      setAuthToken(credentials.accessToken);

      // Prepare user data with fallback values
      const userData = {
        firstname: user.given_name || user.name?.split(' ')[0] || '',
        lastname: user.family_name || (user.name ? user.name.split(' ').slice(1).join(' ') : ''),
        phonenumber: '',
        email: user.email || '',
        role: roleId,
        userID: user.sub || '',
      };

      console.log('Submitting activation request with data:', JSON.stringify(userData));

      // Submit activation request
      await submitActivation(userData);
      Alert.alert(
        'Request Submitted', 
        `Your request for ${roleName} role has been submitted successfully. You will be notified when it's approved.`
      );
      navigation.goBack();
    } catch (error) {
      console.error('Role activation error:', error);
      let errorMessage = 'There was an error submitting your request.';
      
      // More specific error messages based on error type
      if (error.response) {
        // The request was made and the server responded with an error status
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log out and log in again.';
        } else if (error.response.status === 409) {
          errorMessage = 'You have already requested this role.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      Alert.alert('Request Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Connecting to backend...</Text>
      </View>
    );
  }

  if (backendStatus && backendStatus !== 'Connected') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Cannot connect to local backend server (http://192.168.0.60:6060)
        </Text>
        <Text style={styles.errorDetail}>
          Make sure your backend server is running and accessible from your device.
        </Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.roleButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (tokenError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Authentication error: {tokenError}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.roleButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Role to Activate</Text>
      {backendStatus === 'Connected' && <Text style={styles.connectedText}>Connected to: http://192.168.0.60:6060</Text>}
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={styles.roleButton}
            onPress={() => handleRoleActivation(role.id, role.name)}
          >
            <Text style={styles.roleButtonText}>{role.name}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20,
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  roleButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '80%',
  },
  roleButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#8E8E8E',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '50%',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  connectedText: {
    color: 'green',
    marginBottom: 20,
    fontSize: 14,
  }
});

export default ActivateRoleScreen;