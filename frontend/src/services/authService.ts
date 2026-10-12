import api from './api.js';

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
const response = await api.post<LoginResponse>(
'/auth/login',
credentials,
);

return response.data;
};
