import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GovernmentAgentScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, Government Agent!</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.descriptionText}>
          As a Government Agent, you can approve tax refunds and send alerts to taxpayers.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ApproveRefund')}
      >
        <Text style={styles.buttonText}>Approve Tax Refund</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TaxpayerAlerts')}
      >
        <Text style={styles.buttonText}>Taxpayer Alerts</Text>
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

export default GovernmentAgentScreen;