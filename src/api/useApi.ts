import { useState, useCallback } from 'react';
import { useAuth0 } from 'react-native-auth0';
import { setAuthToken } from './apiClient';

// Generic API hook that handles token management and loading/error states
export const useApi = <T, P = any>(
  apiFunction: (params?: P) => Promise<{ data: T }>,
  immediate = false,
  initialParams?: P
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { getCredentials } = useAuth0();

  const execute = useCallback(
    async (params?: P) => {
      setIsLoading(true);
      setError(null);

      try {
        // Get fresh token
        const credentials = await getCredentials();
        if (credentials?.accessToken) {
          setAuthToken(credentials.accessToken);
        } else {
          throw new Error('No access token available');
        }

        // Call the API function
        const result = await apiFunction(params);
        setData(result.data);
        return result.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, getCredentials]
  );

  // If immediate is true, execute the API call when the hook is first used
  useState(() => {
    if (immediate) {
      execute(initialParams);
    }
  });

  return {
    data,
    isLoading,
    error,
    execute,
  };
};

export default useApi;