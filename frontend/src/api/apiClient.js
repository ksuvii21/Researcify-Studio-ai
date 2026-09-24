import axios from "axios";
import {
  getToken,
  removeToken,
} from "../utils/storage";

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api/v1",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 15000,
});


// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong.";

    /*
     * Authentication failure
     */
    if (status === 401) {
      removeToken();
    }

    const normalizedError = new Error(message);

    normalizedError.status = status;
    normalizedError.errors =
      error.response?.data?.errors || [];

    return Promise.reject(normalizedError);
  }
);

export default apiClient;