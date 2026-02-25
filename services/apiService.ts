// sistema-loja/services/apiService.ts
import type { User, Product } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiServiceErrorData {
  message: string;
  [key: string]: any; 
}
export class ApiError extends Error {
  status: number;
  data?: ApiServiceErrorData;

  constructor(message: string, status: number, data?: ApiServiceErrorData) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let authToken: string | null = null;

const setToken = (token: string | null) => {
  authToken = token;
};

const request = async <T>(endpoint: string, method: string, body?: any): Promise<T | null> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      throw new ApiError(errorData?.errors?.[0]?.description || errorData?.message || `Erro HTTP: ${response.status}`, response.status, errorData);
    }
    
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json() as T;
    } else {
        const text = await response.text();
        if (text) {
          console.warn(`API response for ${endpoint} was not JSON:`, text);
        }
        return null; 
    }

  } catch (error) {
    console.error(`API ${method} request to ${endpoint} failed:`, error);
    
    if (error instanceof ApiError) {
      if (error.status === 401 && !endpoint.includes('/auth/login')) {
        console.warn('Authentication error (401). Token might be expired. Logging out.');
        
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        window.location.href = '/#/login';
        
        throw new ApiError('Sua sessão expirou. Você será redirecionado para a página de login.', 401);
      }
      throw error;
    }

    throw new ApiError( (error as Error).message || 'Network error', 0, { message: (error as Error).message });
  }
};

const getMyProfile = async (): Promise<User | null> => {
  return request<User>('/users/me', 'GET');
};

const uploadAndProcessImage = async (file: File): Promise<{ imageUrl: string } & Partial<Product>> => {
    const formData = new FormData();
    formData.append('image', file);

    const headers: HeadersInit = {};
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json();
        throw new ApiError(err.message || 'Falha ao processar a imagem.', response.status, err);
    }
    return response.json();
};

// FIX: Add uploadImage function to handle simple image uploads without AI processing.
const uploadImage = async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const headers: HeadersInit = {};
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/image-only`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json();
        throw new ApiError(err.message || 'Falha ao fazer upload da imagem.', response.status, err);
    }
    return response.json();
};

const apiService = {
  setToken,
  get: <T>(endpoint: string) => request<T>(endpoint, 'GET'),
  post: <T>(endpoint: string, body: any) => request<T>(endpoint, 'POST', body),
  put: <T>(endpoint: string, body: any) => request<T>(endpoint, 'PUT', body),
  patch: <T>(endpoint: string, body: any) => request<T>(endpoint, 'PATCH', body),
  del: <T>(endpoint: string) => request<T>(endpoint, 'DELETE'),
  uploadImage,
  uploadAndProcessImage,
  getMyProfile,
};

export default apiService;
