import React from 'react';
import { Alert, Button, Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import config from './auth0-configuration';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  ActivateRole: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const LoginScreen = ({ navigation }: StackScreenProps<RootStackParamList, 'Login'>) => {
  const { authorize, user, isLoading } = useAuth0();

  const onLogin = async () => {
    try {
      // Initiate the authorization process.
      await authorize({}, {});
    } catch (loginError) {
      if (loginError instanceof Error) {
        Alert.alert('Login Error', loginError.message);
      } else {
        Alert.alert('Login Error', 'An unexpected error occurred');
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to Department of Revenue Services</Text>
      <View style={styles.buttonContainer}>
        <Button title="Sign In" onPress={onLogin} />
        <Button title="Sign Up" onPress={onLogin} />
      </View>
      {user && (
        <Button title="Go to Home" onPress={() => navigation.replace('Home')} />
      )}
    </View>
  );
};

const HomeScreen = ({ navigation }: StackScreenProps<RootStackParamList, 'Home'>) => {
  const { user, clearSession } = useAuth0();

  // Placeholder for current user role. Replace with real user role data.
  const userRole = user ? 'a_Registered_User' : 'None';

  const onLogout = async () => {
    try {
      // Clear session on logout.
      await clearSession({}, {});
      navigation.replace('Login');
    } catch (logoutError) {
      if (logoutError instanceof Error) {
        Alert.alert('Logout Error', logoutError.message);
      } else {
        Alert.alert('Logout Error', 'An unexpected error occurred');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Government Profile</Text>
      {user ? (
        <View style={styles.profileContainer}>
          {user.name && <Text style={styles.profileText}>Name: {user.name}</Text>}
          {user.nickname && <Text style={styles.profileText}>Nickname: {user.nickname}</Text>}
          {user.email && <Text style={styles.profileText}>Email: {user.email}</Text>}
          {user.sub && <Text style={styles.profileText}>User ID: {user.sub}</Text>}
        </View>
      ) : (
        <Text>You are not logged in</Text>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Activate Role" onPress={() => navigation.navigate('ActivateRole')} />
        <Button title="Deactivate Role" onPress={() => Alert.alert('Deactivate Role functionality not implemented yet')} />
      </View>
      <Text style={styles.profileText}>Current Role: {userRole}</Text>
      <Button title="Log Out" onPress={onLogout} />
    </View>
  );
};

const ActivateRoleScreen = ({ navigation }: StackScreenProps<RootStackParamList, 'ActivateRole'>) => {
  const roles = [
    'Individual Tax Payer',
    'Business Officer',
    'Government Agent',
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Role to Activate</Text>
      {roles.map((role, index) => (
        <TouchableOpacity
          key={index}
          style={styles.roleButton}
          onPress={() => {
            // Replace alert with API call to activate role.
            Alert.alert(`Role '${role}' activated`);
            navigation.goBack();
          }}>
          <Text style={styles.roleButtonText}>{role}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const MainApp = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ActivateRole" component={ActivateRoleScreen} options={{ title: 'Activate Role' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <Auth0Provider domain={config.domain} clientId={config.clientId}>
      <MainApp />
    </Auth0Provider>
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
  buttonContainer: {
    width: '80%',
    marginBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileText: {
    fontSize: 18,
    marginBottom: 5,
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
});

export default App;