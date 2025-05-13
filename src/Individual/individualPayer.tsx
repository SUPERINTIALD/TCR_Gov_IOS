import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const IndividualPayerScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, Individual Tax Payer!</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.descriptionText}>
            As an Individual Tax Payer, you can check your taxes and refund status.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TaxStatus')}
      >
        <Text style={styles.buttonText}>Check Your Taxes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RefundStatus')}
      >
        <Text style={styles.buttonText}>Check Refund Status</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Resources')}
      >
        <Text style={styles.buttonText}>View Tax Resources</Text>
      </TouchableOpacity> */}
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

export default IndividualPayerScreen;