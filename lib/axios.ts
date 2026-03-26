/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios';

import { API_ROOT } from '@/utils/constants';
import { toast } from 'sonner';

const axiosInstance = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor to add auth token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    // console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;

    const message =
      error?.response?.data?.message || error.message || 'Something went wrong';

    if (originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    // ❌ Không retry refresh token API
    if (originalRequest?.url?.includes('/auth/refresh_token')) {
      window.location.href = '/auth/login';
      return Promise.reject(error);
    }

    // ❌ Đã retry rồi thì dừng
    if (originalRequest._retry) {
      window.location.href = '/auth/login';
      return Promise.reject(error);
    }

    // if (error.response?.status === 401) return Promise.reject(error);
    if (error.response?.status === 410) {
      originalRequest._retry = true;

      try {
        await axiosInstance.put('/auth/refresh_token');
        return axiosInstance(originalRequest);
      } catch (err) {
        window.location.href = '/auth/login';
        return Promise.reject(err);
      }
    }

    toast.error(message);

    return Promise.reject(error);
  },
);

export default axiosInstance;
