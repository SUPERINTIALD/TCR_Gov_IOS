import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth0 } from 'react-native-auth0';

const AdminScreen = () => {
  const { user } = useAuth0();
  
  // Extract admin role information
  const adminRoleId = 'e_admin_portal';
  const adminRoleValue = 'Administrator (Goverment Web Application)';
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hello Admin!</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Role ID:</Text>
        <Text style={styles.value}>{adminRoleId}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Role Value:</Text>
        <Text style={styles.value}>{adminRoleValue}</Text>
      </View>
      
      {user && (
        <>
          <Text style={styles.welcomeText}>
            Welcome, {user.name || user.nickname || 'Administrator'}!
          </Text>
          <Text style={styles.descriptionText}>
            As an administrator, you have access to manage role requests and user permissions.
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#007AFF',
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    width: '100%',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 100,
  },
  value: {
    fontSize: 18,
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    marginTop: 30,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
    color: '#555',
    paddingHorizontal: 20,
  }
});

export default AdminScreen;