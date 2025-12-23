import axios from 'axios';
import Cookies from 'js-cookie';

// Hardcoded for CodeSandbox deployment - DO NOT CHANGE
const API_URL = 'https://4ngpvr-8000.csb.app';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface SignalData {
  id: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
  processed_at?: string;
  processed_data?: {
    time: number[];
    channel1: number[];
    channel2: number[];
    channel3: number[];
  };
  metrics?: any;
}

export interface CalculationData {
  id: string;
  hr: number | null;
  ptt: number | null;
  mbp: number | null;
  created_at: string;
  file_name?: string;
}

export const authAPI = {
  register: async (email: string, username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/', {
      email,
      username,
      password,
      password_confirm: password,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login/', {
      email,
      password,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/user/me/');
    return response.data;
  },
};

export const dataAPI = {
  upload: async (file: File): Promise<SignalData> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/data/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  process: async (dataId: string): Promise<any> => {
    const response = await api.post(`/data/process/${dataId}/`);
    return response.data;
  },

  getResult: async (dataId: string): Promise<SignalData> => {
    const response = await api.get(`/data/result/${dataId}/`);
    return response.data;
  },

  list: async (): Promise<SignalData[]> => {
    const response = await api.get('/data/list/');
    return response.data;
  },

  delete: async (dataId: string): Promise<void> => {
    await api.delete(`/data/delete/${dataId}/`);
  },
};

export const calculationAPI = {
  create: async (data: {
    ri: number;
    ri_next: number;
    foot_j: number;
    r_j: number;
    h: number;
    file_name?: string;
  }): Promise<CalculationData> => {
    const response = await api.post('/calculations/create/', data);
    return response.data;
  },

  list: async (): Promise<CalculationData[]> => {
    const response = await api.get('/calculations/list/');
    return response.data;
  },

  delete: async (calculationId: string): Promise<void> => {
    await api.delete(`/calculations/delete/${calculationId}/`);
  },
};

export default api;

