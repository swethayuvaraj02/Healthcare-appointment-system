import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export const login = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    `${API_URL}/login`,
    credentials,
  );

  return response.data;
};

export const register = async (
  details: RegisterRequest,
): Promise<void> => {
  await axios.post(`${API_URL}/register`, details);
};
