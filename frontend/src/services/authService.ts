import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
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