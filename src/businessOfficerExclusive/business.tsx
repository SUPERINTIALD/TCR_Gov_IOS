import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';

const BusinessScreen = () => {
  const { user } = useAuth0();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, Business Officer!</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.descriptionText}>
          As a Business Officer, you can manage tax filings and refund statuses.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ActivateRole')}
      >
        <Text style={styles.buttonText}>Activate Role</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('DeactivateRole')}
      >
        <Text style={styles.buttonText}>Deactivate Role</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('FileTax')}
      >
        <Text style={styles.buttonText}>Check Your Tax</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TaxStatus')}
      >
        <Text style={styles.buttonText}>Check Refund Status</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BusinessScreen;