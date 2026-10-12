import api from './api';

const API_URL = 'http://localhost:3000/api/v1/doctors';

export interface Doctor {
  id: number;
  name: string;
  email: string;
  specialization: string;
  availability?: string;
  isActive: boolean;
}

export interface DoctorPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DoctorListResponse {
  data: Doctor[];
  pagination: DoctorPagination;
}

export const getDoctors = async (
  search?: string,
  page = 1,
  limit = 5,
): Promise<DoctorListResponse> => {
  const response = await api.get(API_URL, {
    params: {
      ...(search ? { search } : {}),
      page,
      limit,
    },
  });

  return response.data;
};

export const getDoctor = async (id: number): Promise<Doctor> => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const createDoctor = async (
  name: string,
  email: string,
  specialization: string,
  availability: string,
): Promise<Doctor> => {
  const response = await api.post(`${API_URL}/create`, {
    name,
    email,
    specialization,
    availability,
  });

  return response.data;
};

export const updateDoctor = async (
  id: number,
  name: string,
  email: string,
  specialization: string,
  availability: string,
): Promise<Doctor> => {
  const response = await api.post(`${API_URL}/update`, {
    id,
    name,
    email,
    specialization,
    availability,
  });

  return response.data;
};

export const deactivateDoctor = async (id: number): Promise<Doctor> => {
  const response = await api.post(`${API_URL}/deactivate`, {
    id,
  });

  return response.data;
};