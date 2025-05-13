import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { Provider, useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../auth0-configuration';


// Import IndividualPayer
import IndividualPayerScreen from './Individual/individualPayer';
// Import admin
import AdminScreen from './admin/admin';

// Import business officer exclusive
import BusinessScreen from './businessOfficerExclusive/business';

// Import government agent exclusive
import GovernmentAgentScreen from './governmentAgent/government';
// Import screens
import ActivateRoleScreen from './screens/ActivateRoleScreen';
import DeactivateRoleScreen from './screens/DeactivateRoleScreen';


import store, { setUserRoles, RootState } from './store';
import { fetchUserRolesFromAPI, parseJwt } from './getUserData/loadUser';
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
      console.log('User is authenticated, navigating to Home...');
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
  const { user, getCredentials } = useAuth0();
  const dispatch = useDispatch();
  const userRoles = useSelector((state: RootState) => state.userRoles.redux_userRoles);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Fetch and process user roles when user changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          setIsLoading(true);
          // Get token info
          const credentials = await getCredentials();
          
          if (credentials?.accessToken) {
            // Set the access token for all API requests
            setAuthToken(credentials.accessToken);
            
            // Log the token's payload to help debugging
            const tokenPayload = parseJwt(credentials.accessToken);
            console.log('Token payload (parsed):', JSON.stringify(tokenPayload));
            
            // Use enhanced role fetching that uses Auth0 Management API like web app
            if (user.sub) {
              console.log('Fetching roles for user:', user.sub);
              try {
                const roles = await fetchUserRolesFromAPI(user.sub, credentials.accessToken);
                console.log('Final roles assigned:', roles);
                
                // We should always have at least one role (a_Registered_User)
                dispatch(setUserRoles(roles));
              } catch (roleError) {
                console.error('Error fetching roles:', roleError);
                // For specific test user, assign admin role even if fetch fails
                // if (user.email === 'fung.yuri.intern@gmail.com') {
                //   console.log('Setting test admin role as fallback');
                //   dispatch(setUserRoles(['e_admin_portal']));
                // } else {
                //   // Otherwise, use the default registered user role
                //   dispatch(setUserRoles(['a_Registered_User']));
                // }
              }
            }
          }
        } catch (error) {
          console.log('Error setting up user:', error);
          dispatch(setUserRoles(['a_Registered_User']));
        } finally {
          setIsLoading(false);
        }
      } else {
        dispatch(setUserRoles([]));
        setIsLoading(false);
      }
    };
    
    fetchUserRole();
  }, [user, dispatch, getCredentials]);

  useEffect(() => {
    if (!user) {
      console.log('User is not logged in, navigating to Login...');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [user, navigation]);

  const onLogout = async () => {
    try {

      setIsLoggingOut(true);
      console.log('Starting logout process...');
  
      await AsyncStorage.setItem('@auth_clear_session', 'true');
      setAuthToken('');
      dispatch(setUserRoles([]));
      

      await AsyncStorage.multiRemove([
        '@auth_access_token',
        '@auth_id_token',
        '@auth_refresh_token',
        '@auth_credentials',
        '@auth0_management_token'
      ]);
    
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

  // Check for role
  const isIndividualPayer = userRoles.includes('b_Individual_Payer');
  const isBusinessOfficer = userRoles.includes('c_Officer');
  const isGovernmentAgent = userRoles.includes('d_Government_agent');
  const isAdmin = userRoles.includes('e_admin_portal');
  
  // Check for any active role - now using exact role names from Auth0
  const hasRole = userRoles.some(role => 
    role === 'b_Individual_Payer' || 
    role === 'c_Officer' || 
    role === 'd_Government_agent'
  );

  // Check if only registered user (no other roles)
  const isOnlyRegisteredUser = userRoles.length === 1 && userRoles.includes('a_Registered_User');

  // Get friendly role name for display
  const getRoleFriendlyName = () => {
    if (userRoles.includes('e_admin_portal')) return 'Admin';
    if (userRoles.includes('d_Government_agent')) return 'Government Agent';
    if (userRoles.includes('c_Officer')) return 'Business Officer';
    if (userRoles.includes('b_Individual_Payer')) return 'Individual Tax Payer';
    if (userRoles.includes('a_Registered_User')) return 'Registered User';
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
          <Text style={styles.profileText}>Assigned Roles: {userRoles.join(', ') || 'None'}</Text>
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
        ) : 
        
        isBusinessOfficer ? (
          // Show Business Officer Screen button if user has business officer role
          <Button 
            title="Go to Business Officer Dashboard" 
            onPress={() => navigation.navigate('BusinessOfficer')} 
          />
        ) :
        
        (
          // Show regular buttons for non-admin users
          <>
            {/* Add Government Agent button if the user has the Government Agent role */}
            {isGovernmentAgent && (
              <Button 
                title="Go to Government Dashboard" 
                onPress={() => navigation.navigate('GovernmentAgent')} 
              />
            )}
            {/* Add Individual Payer button if the user has the Individual Payer role */}
            {isIndividualPayer && (
              <Button 
                title="Go to Individual Dashboard" 
                onPress={() => navigation.navigate('IndividualPayer')} 
              />
            )}




            {/* Only show Activate Role button for registered users with no other roles */}
            {isOnlyRegisteredUser && (
              <Button 
                title="Activate Role" 
                onPress={() => navigation.navigate('ActivateRole')} 
              />
            )}
            {/* Only show Deactivate Role button if user has an active role (not just registered) */}
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

const MainApp = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerLeft: () => null }} />
        <Stack.Screen name="ActivateRole" component={ActivateRoleScreen} options={{ title: 'Activate Role' }}/>
        <Stack.Screen name="DeactivateRole" component={DeactivateRoleScreen} options={{ title: 'Deactivate Role' }}/>
        <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Dashboard' }}/>
        <Stack.Screen name="BusinessOfficer" component={BusinessScreen} options={{ title: 'Business Dashboard' }}/>
        <Stack.Screen name="GovernmentAgent" component={GovernmentAgentScreen} options={{ title: 'Government Agent Dashboard' }}/>
        <Stack.Screen name="IndividualPayer" component={IndividualPayerScreen} options={{ title: 'Individual Dashboard' }} />
        {/* <Stack.Screen name="FileTax" component={FileTaxScreen} options={{ title: 'File Taxes' }} />
        <Stack.Screen name="TaxStatus" component={TaxStatusScreen} options={{ title: 'Tax Status' }} /> */}
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
