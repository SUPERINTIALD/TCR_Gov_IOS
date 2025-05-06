import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { Provider, useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../auth0-configuration';

// Import screens
import AdminScreen from './admin/admin';
import ActivateRoleScreen from './screens/ActivateRoleScreen';
import DeactivateRoleScreen from './screens/DeactivateRoleScreen';

// Import store and actions
import store, { setUserRoles, RootState } from './store';
import { setAuthToken } from './api/apiClient';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  ActivateRole: undefined;
  DeactivateRole: undefined;
  Admin: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const LoginScreen = ({ navigation }: StackScreenProps<RootStackParamList, 'Login'>) => {
  const { authorize, user, isLoading, clearSession } = useAuth0();
  const [processingAuth, setProcessingAuth] = useState(false);

  // Check if we're coming from logout and need to clear session
  useEffect(() => {
    const checkLogoutState = async () => {
      try {
        const needsClear = await AsyncStorage.getItem('@auth_clear_session');
        if (needsClear === 'true') {
          console.log('Detected logout state, clearing session...');
          await clearSession();
          await AsyncStorage.removeItem('@auth_clear_session');
        }
      } catch (error) {
        console.log('Error checking logout state:', error);
      }
    };
    
    checkLogoutState();
    
    // If user is already authenticated, go to home screen
    if (user) {
      navigation.replace('Home');
    }
  }, [user, navigation, clearSession]);

  const onLogin = async () => {
    try {
      setProcessingAuth(true);
      
      // Start fresh Auth0 login with required scopes and audience
      await authorize({
        audience: config.audience,
        scope: 'openid profile email',
        prompt: 'login', // Forces re-authentication
      });
      
      // Navigation is handled by the useEffect watching user state
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'Failed to sign in. Please try again.');
      setProcessingAuth(false);
    }
  };

  const onSignUp = async () => {
    try {
      setProcessingAuth(true);
      
      // For sign-up we add screen_hint to show registration
      await authorize({
        audience: config.audience,
        scope: 'openid profile email',
        prompt: 'login',
        screen_hint: 'signup'
      });
      
      // Navigation is handled by the useEffect watching user state
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Sign Up Error', 'Failed to create account. Please try again.');
      setProcessingAuth(false);
    }
  };

  if (isLoading || processingAuth) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {processingAuth ? 'Processing authentication...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to Department of Revenue Services</Text>
      <View style={styles.buttonContainer}>
        <Button title="Sign In" onPress={onLogin} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Sign Up" onPress={onSignUp} />
      </View>
    </View>
  );
};

const HomeScreen = ({ navigation }: StackScreenProps<RootStackParamList, 'Home'>) => {
  const { user, clearSession, getCredentials } = useAuth0();
  const dispatch = useDispatch();
  const userRoles = useSelector((state: RootState) => state.userRoles.redux_userRoles);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Ensure we have a user and token
  useEffect(() => {
    const setupUser = async () => {
      if (user) {
        try {
          // Get user credentials
          const credentials = await getCredentials();
          if (credentials?.accessToken) {
            setAuthToken(credentials.accessToken);
            
            // Set test admin role for specific user - temporary solution
            if (user.email === 'fung.yuri.intern@gmail.com') {
              dispatch(setUserRoles(['e_admin_portal']));
            }
          }
        } catch (error) {
          console.error('Error setting up user:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // No user, go to login
        navigation.replace('Login');
      }
    };
    
    setupUser();
  }, [user, getCredentials, dispatch, navigation]);

  const onLogout = async () => {
    try {
      // Start logout process
      setIsLoggingOut(true);
      console.log('Starting logout process...');
      
      // Mark that we need to clear session
      await AsyncStorage.setItem('@auth_clear_session', 'true');
      
      // Clear API token
      setAuthToken('');
      
      // Clear user roles
      dispatch(setUserRoles([]));
      
      // Clear local storage
      await AsyncStorage.multiRemove([
        '@auth_access_token',
        '@auth_id_token',
        '@auth_refresh_token',
        '@auth_credentials'
      ]);
      
      // Navigate to login - session clearing will happen there
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Error', 'There was a problem signing out. Please try again.');
      setIsLoggingOut(false);
    }
  };

  // Check for admin role
  const isAdmin = userRoles.includes('e_admin_portal');
  
  // Check for any active role
  const hasRole = userRoles.some(role => 
    role === 'b_Individual_Payer' || 
    role === 'c_Officer' || 
    role === 'd_Government_agent'
  );

  // Get friendly role name for display
  const getRoleFriendlyName = () => {
    if (userRoles.includes('e_admin_portal')) return 'Admin';
    if (userRoles.includes('d_Government_agent')) return 'Government Agent';
    if (userRoles.includes('c_Officer')) return 'Business Officer';
    if (userRoles.includes('b_Individual_Payer')) return 'Individual Tax Payer'; 
    return 'Registered User';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  if (isLoggingOut) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Signing out...</Text>
      </View>
    );
  }

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
      
      <Text style={styles.profileText}>Current Role: {getRoleFriendlyName()}</Text>
      
      <View style={styles.buttonContainer}>
        {isAdmin ? (
          // Show Admin Screen button if user has admin role
          <Button 
            title="Go to Admin Dashboard" 
            onPress={() => navigation.navigate('Admin')} 
          />
        ) : (
          // Show regular buttons for non-admin users
          <>
            {!hasRole && (
              <Button 
                title="Activate Role" 
                onPress={() => navigation.navigate('ActivateRole')} 
              />
            )}
            {hasRole && (
              <Button 
                title="Deactivate Role" 
                onPress={() => navigation.navigate('DeactivateRole')} 
              />
            )}
          </>
        )}
      </View>
      
      <Button title="Log Out" onPress={onLogout} />
    </View>
  );
};

// Rest of your navigation code stays the same
const MainApp = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerLeft: () => null }} />
        <Stack.Screen name="ActivateRole" component={ActivateRoleScreen} options={{ title: 'Activate Role' }}/>
        <Stack.Screen name="DeactivateRole" component={DeactivateRoleScreen} options={{ title: 'Deactivate Role' }}/>
        <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Dashboard' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <Auth0Provider 
      domain={config.domain} 
      clientId={config.clientId}
      audience={config.audience}
    >
      <Provider store={store}>
        <MainApp />
      </Provider>
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
    marginVertical: 10,
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default App;
