import axios from 'axios';

// Use relative paths - works on any network (localhost, 192.168.x.x, hotspot, college network)
// The Next.js rewrites config handles proxying to actual backend
let API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://suddheats-freelance-project-production-b773.up.railway.app';
if (API_URL.startsWith('http') && !API_URL.endsWith('/api')) {
    API_URL = `${API_URL}/api`;
}

console.log('🌐 API URL configured:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Auto-attach JWT token to all requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        try {
            const token = localStorage.getItem('shuddheats_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.warn('Could not access localStorage for token');
        }
    }
    // Log request for debugging
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        try {
            const hasToken = localStorage?.getItem('shuddheats_token') ? true : false;
            console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                hasToken,
            });
        } catch (e) {}
    }
    return config;
});

// Handle responses and errors
api.interceptors.response.use(
    (response) => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            console.log(`📥 API Response: ${response.status} ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            try {
                localStorage.removeItem('shuddheats_token');
                localStorage.removeItem('shuddheats_user');
            } catch (e) {
                console.warn('Could not clear localStorage on 401');
            }
            console.log('🔓 Token expired or invalid, cleared storage');
        }

        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // Use console.warn instead of console.error so Next.js doesn't show the error overlay for expected 401s
            console.warn(`❌ API Error: ${error.response?.status} ${error.config?.url}`, {
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
                isNetworkError: !error.response,
            });
        }

        return Promise.reject(error);
    }
);

export default api;

