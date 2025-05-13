import axios from 'axios';

// Update the backend URL to point to your local Flask server
// const backend = 'http://192.168.0.60:6060';
const backend = 'http://localhost:6060';
// Create axios instance with some default configurations
const apiClient = axios.create({
  baseURL: backend,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Set the authorization token for all requests
export const setAuthToken = (token: string) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    console.log('Access token set for API requests');
  } else {
    delete apiClient.defaults.headers.common.Authorization;
    console.log('Access token cleared from API client');
  }
};

// Add request interceptor to log requests (helpful for debugging)
apiClient.interceptors.request.use(
  config => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// API functions mirroring the endpoints from your web application
export const getActiveRequests = async () => {
  return apiClient.get('/api/read-all-requests');
};

export const getDeactiveRequests = async () => {
  return apiClient.get('/api/read-all-requests-deactive');
};

export const assignRole = async (user_id: string, role: string) => {
  return apiClient.post('/api/assign-role', { user_id, role });
};

export const deleteRole = async (user_id: string, role: string) => {
  return apiClient.post('/api/delete-role', { user_id, role });
};

export const deleteRequest = async (id: string) => {
  return apiClient.delete(`/api/delete-request/${id}`);
};

export const deleteRequestDeactive = async (id: string) => {
  return apiClient.delete(`/api/delete-request-deactivate/${id}`);
};

export const submitTaxReport = async (reportData: any) => {
  return apiClient.post('/api/submit-tax-report', reportData);
};

export const submitActivation = async (userData: {
  firstname: string,
  lastname: string,
  phonenumber: string,
  email: string,
  role: string,
  userID: string
}) => {
  return apiClient.post('/api/submit', userData);
};

export const submitDeactivation = async (userData: {
  firstname: string,
  lastname: string,
  phonenumber: string,
  email: string,
  role: string,
  userID: string
}) => {
  return apiClient.post('/api/submit-deactive', userData);
};

// New function to check backend connectivity
export const checkBackendConnection = async () => {
  try {
    const response = await apiClient.get('/api/health');
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Backend connection check failed:', error);
    return { status: 500, error };
  }
};

export default apiClient;