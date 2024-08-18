import axios from 'axios';

// Set up Axios default Authorization header
const token = localStorage.getItem('access_token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Function to handle token refreshing
const refreshAuthLogic = async (failedRequest) => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        console.error('No refresh token available');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (failedRequest.config.requiresAuth) {
            window.location.href = '/login';
        }
        return Promise.reject('No refresh token');
    }

    try {
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
        });

        // Store the new access token
        localStorage.setItem('access_token', response.data.access);

        // Update the Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

        // Retry the original request with the new token
        failedRequest.response.config.headers['Authorization'] = `Bearer ${response.data.access}`;
        return Promise.resolve();
    } catch (error) {
        console.error('Token refresh failed', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (failedRequest.config.requiresAuth) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
};

// Axios interceptor to handle 401 errors
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            return refreshAuthLogic(originalRequest).then(() => {
                return axios(originalRequest);  // Retry the original request
            });
        }
        return Promise.reject(error);
    }
);
