import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { submitDeactivation } from '../api/apiClient';
import { useSelector } from 'react-redux';

type RootState = {
  userRoles: {
    redux_userRoles: string[];
  }
};

const DeactivateRoleScreen = () => {
  const navigation = useNavigation();
  const { user, getCredentials } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);
  
  // In a real implementation, you would use Redux to store user roles
  // For simplicity, we're assuming roles are passed via props or stored locally
  const userRoles = useSelector((state: RootState) => state.userRoles.redux_userRoles);
  
  const roleMapping = {
    'b_Individual_Payer': { id: 'tax_payer', name: 'Individual Tax Payer' },
    'c_Officer': { id: 'business_officer', name: 'Business Officer' },
    'd_Government_agent': { id: 'government_agent', name: 'Government Agent' },
  };

  const handleRoleDeactivation = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to request role deactivation');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get token for authorization
      const credentials = await getCredentials();
      if (!credentials?.accessToken) {
        throw new Error('No access token available');
      }

      // Determine which role to deactivate based on user's current roles
      let roleId = 'tax_payer'; // default
      let roleName = 'Individual Tax Payer'; // default
      
      if (userRoles.includes('b_Individual_Payer')) {
        roleId = 'tax_payer';
        roleName = 'Individual Tax Payer';
      } else if (userRoles.includes('c_Officer')) {
        roleId = 'business_officer';
        roleName = 'Business Officer';
      } else if (userRoles.includes('d_Government_agent')) {
        roleId = 'government_agent';
        roleName = 'Government Agent';
      }

      // Prepare user data
      const userData = {
        firstname: user.given_name || user.name || '',
        lastname: user.family_name || '',
        phonenumber: '',
        email: user.email || '',
        role: roleId,
        userID: user.sub || '',
      };

      // Submit deactivation request
      await submitDeactivation(userData);
      Alert.alert(
        'Request Submitted', 
        `Your request to deactivate the ${roleName} role has been submitted successfully. You will be notified when it's processed.`
      );
      navigation.goBack();
    } catch (error) {
      console.error('Role deactivation error:', error);
      Alert.alert(
        'Request Failed', 
        'There was an error submitting your deactivation request.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // If user has no roles, show appropriate message
  const hasRoles = userRoles && userRoles.some(role => 
    role === 'b_Individual_Payer' || 
    role === 'c_Officer' || 
    role === 'd_Government_agent'
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Deactivate Role</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : hasRoles ? (
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmText}>
            Please confirm you would like to deactivate your role:
          </Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deactivateButton}
              onPress={handleRoleDeactivation}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.noRoleText}>
          You don't have any active roles to deactivate.
        </Text>
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
  confirmationContainer: {
    width: '90%',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#8E8E8E',
    padding: 15,
    borderRadius: 8,
    width: '45%',
  },
  deactivateButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    width: '45%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noRoleText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
});

export default DeactivateRoleScreen;